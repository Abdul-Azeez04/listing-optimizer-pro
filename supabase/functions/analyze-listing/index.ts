import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Verify user
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    // Parse & validate body
    const body = await req.json();
    const { platform, category, original_title, original_description, target_buyer } = body;

    if (!platform || !category || !original_title || !original_description || !target_buyer) {
      return new Response(
        JSON.stringify({ error: "All fields are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["etsy", "amazon", "shopify"].includes(platform)) {
      return new Response(
        JSON.stringify({ error: "Invalid platform." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (original_description.length < 100) {
      return new Response(
        JSON.stringify({ error: "Description must be at least 100 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Lovable AI (uses openai/gpt-5 model)
    const systemPrompt = `You are CONVRT.AI, the world's best ecommerce conversion copywriter. You specialize in writing product listings that turn browsers into buyers. You understand buyer psychology deeply — the emotional, analytical, and impulse purchase mindsets. You always respond with valid JSON only. No markdown. No explanation. Just the JSON object.`;

    const userPrompt = `Analyze this ${platform} listing and rewrite it for maximum conversion.

PRODUCT CATEGORY: ${category}
TARGET BUYER: ${target_buyer}
ORIGINAL TITLE: ${original_title}
ORIGINAL DESCRIPTION: ${original_description}

First, score the original listing on a scale of 0–100 based on these 5 criteria (20 points each):
1. Hook Strength — does the title immediately grab attention?
2. Emotional Triggers — does the copy make the buyer feel something?
3. Keyword Placement — are the right search keywords placed naturally?
4. Specificity — does the copy use concrete details rather than vague claims?
5. CTA Clarity — is it clear what action the buyer should take?

Then create 3 rewritten variants. Each variant optimizes for a different buyer psychology:
- EMOTIONAL: Leads with feeling, story, and aspiration. Makes the buyer imagine owning the product.
- ANALYTICAL: Leads with features, specs, quality signals, and logical reasons to buy.
- IMPULSE: Leads with urgency, scarcity, social proof, and immediate desire.

Respond ONLY with this exact JSON structure, no other text:
{
  "original_score": number,
  "original_score_breakdown": {
    "hook_strength": number,
    "emotional_triggers": number,
    "keyword_placement": number,
    "specificity": number,
    "cta_clarity": number
  },
  "variants": [
    {
      "tone": "emotional",
      "title": string,
      "description": string,
      "bullets": [string, string, string, string, string],
      "tags": [string, string, string, string, string, string, string, string, string, string],
      "score": number,
      "score_breakdown": {
        "hook_strength": number,
        "emotional_triggers": number,
        "keyword_placement": number,
        "specificity": number,
        "cta_clarity": number
      },
      "improvement_summary": string
    },
    { ... analytical variant with tone "analytical" ... },
    { ... impulse variant with tone "impulse" ... }
  ]
}`;

    console.log("Calling Lovable AI...");

    const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errText);
      throw new Error(`AI API call failed [${aiResponse.status}]: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the AI response
    let result;
    try {
      // Try to extract JSON if wrapped in code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      result = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate result structure
    if (
      typeof result.original_score !== "number" ||
      !result.original_score_breakdown ||
      !Array.isArray(result.variants) ||
      result.variants.length !== 3
    ) {
      throw new Error("AI response has invalid structure");
    }

    // Save to rewrites table using service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { error: insertError } = await supabaseAdmin.from("rewrites").insert({
      user_id: userId,
      platform,
      category,
      original_title,
      original_description,
      target_buyer,
      original_score: result.original_score,
      variants: result.variants,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      // Don't fail the request if save fails — still return the result
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Something went wrong generating your listing. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
