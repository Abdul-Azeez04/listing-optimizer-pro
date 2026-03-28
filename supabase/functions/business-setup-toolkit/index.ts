import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Business Setup Toolkit — niche finder, business name generator, store setup guide
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { tool_type, interests, skills, budget, location, category, platform } = body;

    let systemPrompt = "";
    let userPrompt = "";

    switch (tool_type) {
      case "niche_finder": {
        systemPrompt = "You are a niche market research expert for ecommerce. Help sellers find profitable niches based on their interests, skills, and market demand. Respond with valid JSON only.";
        userPrompt = `Find the best ecommerce niches for someone with these characteristics:\n- Interests: ${interests || "general crafts"}\n- Skills: ${skills || "general"}\n- Budget: ${budget || "low"}\n- Target market location: ${location || "United States"}\n\nReturn JSON:\n{\n  "recommended_niches": [\n    {\n      "niche": "specific niche name",\n      "why_it_fits": "why this matches their profile",\n      "demand_score": 1-100,\n      "competition": "low" | "medium" | "high",\n      "startup_cost": "estimated range",\n      "profit_potential": "monthly estimate",\n      "best_platform": "etsy" | "amazon" | "shopify",\n      "trending_products": ["product1", "product2", "product3"],\n      "target_buyer": "ideal buyer description",\n      "keywords_to_start": ["kw1", "kw2", "kw3", "kw4", "kw5"]\n    }\n  ] (5-7 niches, ranked by fit),\n  "avoid_niches": [\n    {"niche": "name", "why_avoid": "reason"}\n  ] (2-3 niches to avoid),\n  "action_plan": [\n    "Step 1: ...",\n    "Step 2: ...",\n    "Step 3: ..."\n  ] (5-7 concrete next steps)\n}`;
        break;
      }

      case "business_name": {
        systemPrompt = "You are a brand naming expert specializing in ecommerce brands. Generate creative, memorable business names that work as domain names and social handles. Respond with valid JSON only.";
        userPrompt = `Generate business name ideas for:\n- Category: ${category || "general ecommerce"}\n- Target buyer: ${location || "global"}\n- Vibe/style: ${interests || "modern and clean"}\n- Platform: ${platform || "multi-platform"}\n\nReturn JSON:\n{\n  "names": [\n    {\n      "name": "BrandName",\n      "tagline": "short tagline",\n      "domain_suggestion": "brandname.com or .co",\n      "instagram_handle": "@brandname",\n      "style": "minimal" | "playful" | "luxury" | "earthy" | "bold",\n      "why_it_works": "explanation",\n      "available_extensions": [".com", ".co", ".shop"]\n    }\n  ] (10-15 names),\n  "naming_tips": ["tip1", "tip2", "tip3"] (3 naming best practices),\n  "names_to_avoid_patterns": ["pattern1", "pattern2"] (common naming mistakes)\n}`;
        break;
      }

      case "store_setup": {
        systemPrompt = "You are an ecommerce store setup consultant. Provide a complete, actionable store setup guide tailored to the seller's platform and niche. Respond with valid JSON only.";
        userPrompt = `Create a complete store setup guide for:\n- Platform: ${platform || "etsy"}\n- Category: ${category || "handmade products"}\n- Location: ${location || "United States"}\n- Budget: ${budget || "low"}\n\nReturn JSON:\n{\n  "setup_checklist": [\n    {\n      "step": 1,\n      "title": "step title",\n      "description": "detailed description",\n      "time_estimate": "15 min",\n      "priority": "critical" | "important" | "nice-to-have",\n      "tips": ["tip1", "tip2"]\n    }\n  ] (10-15 steps),\n  "essential_tools": [\n    {"tool": "name", "purpose": "why needed", "free_option": "free alternative", "paid_option": "paid option with price"}\n  ] (5-8 tools),\n  "seo_checklist": [\n    "SEO step 1",\n    "SEO step 2"\n  ] (5-7 items),\n  "photography_tips": ["tip1", "tip2", "tip3"] (5 tips),\n  "pricing_strategy": {\n    "formula": "cost calculation formula",\n    "markup_range": "recommended markup %",\n    "competitive_analysis_tip": "how to research competitor pricing"\n  },\n  "launch_timeline": {\n    "week_1": "what to do",\n    "week_2": "what to do",\n    "week_3": "what to do",\n    "week_4": "what to do"\n  },\n  "common_mistakes": ["mistake1", "mistake2", "mistake3"] (5 mistakes to avoid)\n}`;
        break;
      }

      case "social_setup": {
        systemPrompt = "You are a social media marketing expert for ecommerce businesses. Provide a complete social media setup and strategy guide. Respond with valid JSON only.";
        userPrompt = `Create a social media setup guide for an ecommerce business:\n- Category: ${category || "handmade products"}\n- Target location: ${location || "United States"}\n- Current platforms: ${platform || "none"}\n\nReturn JSON:\n{\n  "platform_priority": [\n    {\n      "platform": "Instagram" | "TikTok" | "Pinterest" | "Facebook" | "Twitter" | "YouTube",\n      "priority": 1-6,\n      "why": "reason this platform matters for this niche",\n      "content_types": ["type1", "type2"],\n      "posting_frequency": "recommended frequency",\n      "bio_template": "optimized bio text",\n      "first_10_posts": ["post idea 1", "post idea 2", ...] (10 post ideas)\n    }\n  ] (top 4 platforms),\n  "content_calendar_template": {\n    "monday": "content theme",\n    "tuesday": "content theme",\n    "wednesday": "content theme",\n    "thursday": "content theme",\n    "friday": "content theme",\n    "saturday": "content theme",\n    "sunday": "content theme"\n  },\n  "hashtag_strategy": {\n    "branded_hashtags": ["#tag1", "#tag2"],\n    "niche_hashtags": ["#tag1", "#tag2", ...] (15-20),\n    "trending_hashtags": ["#tag1", "#tag2", ...] (10)\n  },\n  "growth_tactics": ["tactic1", "tactic2", ...] (5-7 proven tactics)\n}`;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid tool_type. Use: niche_finder, business_name, store_setup, social_setup" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const aiRes = await fetch(AI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiRes.ok) {
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let parsed: any;
    try { parsed = JSON.parse(content); } catch {
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save to tool_outputs
    await supabase.from("tool_outputs").insert({
      user_id: user.id,
      tool_type: `business_setup_${tool_type}`,
      input_data: body,
      output_data: parsed,
    });

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
