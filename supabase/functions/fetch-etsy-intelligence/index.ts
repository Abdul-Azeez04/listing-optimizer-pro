import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Etsy listing intelligence - uses AI to generate realistic category pattern analysis
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const categories = [
      "jewelry", "candles", "art prints", "clothing",
      "digital prints", "craft supplies", "toys", "weddings",
    ];

    let totalProcessed = 0;

    for (const category of categories) {
      // Check for recent patterns
      const { data: existing } = await supabase
        .from("etsy_category_patterns")
        .select("id, created_at")
        .eq("category", category)
        .maybeSingle();

      if (existing) {
        const age = Date.now() - new Date(existing.created_at).getTime();
        if (age < 7 * 24 * 60 * 60 * 1000) continue; // Skip if less than 7 days old
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
              content: "You are an ecommerce copy analyst specializing in Etsy listings. You identify the specific linguistic patterns that separate bestselling listings from invisible ones. Respond with valid JSON only.",
            },
            {
              role: "user",
              content: `Analyze the "${category}" Etsy category and identify what separates bestseller listings (100+ sales) from low performers (<20 sales).\n\nReturn JSON:\n{\n  "bestseller_patterns": {\n    "title_patterns": ["pattern1", "pattern2", ...],\n    "description_patterns": ["pattern1", ...],\n    "emotional_triggers": ["trigger1", ...]\n  },\n  "low_performer_patterns": {\n    "common_mistakes": ["mistake1", ...],\n    "avoid_patterns": ["pattern1", ...]\n  },\n  "top_title_structures": ["[Adjective] [Product] for [Audience] - [Benefit]", ...] (3-5 templates),\n  "top_keywords": ["keyword1", ...] (15-20 keywords),\n  "avg_title_length": number,\n  "avg_description_length": number,\n  "emotional_trigger_frequency": {\n    "urgency": 0.0-1.0,\n    "exclusivity": 0.0-1.0,\n    "social_proof": 0.0-1.0,\n    "sensory": 0.0-1.0,\n    "benefit": 0.0-1.0\n  },\n  "key_rule": "the single most important rule for ${category} listings"\n}`,
            },
          ],
          temperature: 0.4,
        }),
      });

      if (!aiRes.ok) continue;
      const aiData = await aiRes.json();
      let content = aiData.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let parsed: any;
      try { parsed = JSON.parse(content); } catch { continue; }

      await supabase.from("etsy_category_patterns").upsert({
        category,
        bestseller_patterns: parsed.bestseller_patterns || {},
        low_performer_patterns: parsed.low_performer_patterns || {},
        top_title_structures: parsed.top_title_structures || [],
        top_keywords: parsed.top_keywords || [],
        avg_title_length: parsed.avg_title_length || 60,
        avg_description_length: parsed.avg_description_length || 500,
        emotional_trigger_frequency: parsed.emotional_trigger_frequency || {},
        created_at: new Date().toISOString(),
      }, { onConflict: "category" });

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
