import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.claims.sub;

    const body = await req.json();
    const { competitor_title, competitor_description, your_title } = body;

    if (!competitor_title || !competitor_description) {
      return new Response(JSON.stringify({ error: "Competitor title and description are required." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are CONVRT.AI, an expert at competitive analysis for ecommerce sellers. Analyze competitor listings and identify advantages. Respond with valid JSON only." },
          { role: "user", content: `Analyze this competitor listing and identify strengths, weaknesses, and opportunities.\n\nCOMPETITOR TITLE: ${competitor_title}\nCOMPETITOR DESCRIPTION: ${competitor_description}${your_title ? `\nYOUR TITLE: ${your_title}` : ""}\n\nReturn JSON:\n{\n  "strengths": string[] (3-5 things they do well),\n  "weaknesses": string[] (3-5 copy weaknesses),\n  "opportunities": string[] (3-5 ways to differentiate),\n  "suggested_improvements": string[] (3-5 specific actionable improvements)\n}` },
        ],
        temperature: 0.6,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) throw new Error("AI API call failed");
    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content");

    let result;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      result = JSON.parse(jsonMatch ? jsonMatch[1].trim() : content.trim());
    } catch { throw new Error("Failed to parse AI response"); }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    await supabaseAdmin.from("tool_outputs").insert({
      user_id: userId, tool_type: "competitor_analysis", input_data: body, output_data: result,
    });

    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
