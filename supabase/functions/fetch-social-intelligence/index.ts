import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Facebook & Instagram intelligence - AI-generated social media marketing patterns
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const categories = [
      "handmade jewelry", "candles and home scents", "art prints",
      "clothing and accessories", "digital products", "craft supplies",
      "toys and games", "wedding items", "home decor",
    ];

    let totalProcessed = 0;

    for (const category of categories) {
      // Check for recent data
      const { data: existing } = await supabase
        .from("intelligence_cache")
        .select("id, created_at")
        .eq("cache_key", `social_intel_${category.replace(/\s/g, "_")}`)
        .maybeSingle();

      if (existing) {
        const age = Date.now() - new Date(existing.created_at).getTime();
        if (age < 3 * 24 * 60 * 60 * 1000) continue;
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
            {
              role: "system",
              content: "You are a social media marketing analyst specializing in ecommerce seller marketing on Facebook and Instagram. Generate actionable, realistic intelligence. Respond with valid JSON only.",
            },
            {
              role: "user",
              content: `Analyze current Facebook and Instagram marketing trends for "${category}" ecommerce sellers. Return JSON:\n{\n  "facebook_trends": [\n    {\n      "trend": "description of trend",\n      "engagement_type": "likes" | "shares" | "comments" | "saves",\n      "why_it_works": "explanation",\n      "example_post": "example post text"\n    }\n  ] (5 items),\n  "instagram_patterns": [\n    {\n      "content_type": "reel" | "carousel" | "story" | "post",\n      "pattern": "description of what works",\n      "hashtag_strategy": "recommended approach",\n      "caption_hook": "example opening hook"\n    }\n  ] (5 items),\n  "best_posting_times": ["time1", "time2", "time3"],\n  "trending_hashtags": ["#tag1", "#tag2", ...] (10-15 hashtags),\n  "ad_copy_patterns": [\n    {\n      "format": "headline + description",\n      "example_headline": "example",\n      "example_description": "example",\n      "cta_type": "Shop Now" | "Learn More" | "Get Yours"\n    }\n  ] (3 items),\n  "audience_insights": {\n    "demographics": "key demographic info",\n    "interests": ["interest1", "interest2", ...],\n    "buying_triggers": ["trigger1", "trigger2", ...]\n  }\n}`,
            },
          ],
          temperature: 0.6,
        }),
      });

      if (!aiRes.ok) continue;
      const aiData = await aiRes.json();
      let content = aiData.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let parsed: any;
      try { parsed = JSON.parse(content); } catch { continue; }

      await supabase.from("intelligence_cache").upsert({
        cache_key: `social_intel_${category.replace(/\s/g, "_")}`,
        data: parsed,
        source: "social_media",
        category,
        expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: "cache_key" });

      totalProcessed++;
    }

    return new Response(JSON.stringify({ success: true, processed: totalProcessed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
