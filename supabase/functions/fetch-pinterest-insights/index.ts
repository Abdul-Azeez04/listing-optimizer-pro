import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Pinterest intelligence - uses AI to simulate pattern analysis since Pinterest API requires OAuth app approval
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const categories = [
      "handmade jewelry", "handmade candles", "art prints wall decor",
      "crochet patterns", "digital planners", "vintage clothing",
      "home decor handmade", "baby shower gifts", "wedding gifts personalized",
    ];

    let totalProcessed = 0;

    for (const category of categories) {
      // Check if we already have recent data for this category
      const { data: existing } = await supabase
        .from("pinterest_insights")
        .select("id")
        .eq("category", category)
        .gte("fetched_at", new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Use AI to generate Pinterest-style pattern analysis for this category
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
              content: "You are a Pinterest conversion analyst for ecommerce sellers. Generate realistic pin description patterns that perform well on Pinterest for product categories. Respond with valid JSON only.",
            },
            {
              role: "user",
              content: `Generate 5 high-performing Pinterest pin description patterns for the "${category}" product category. For each pin pattern return:\n\n[\n  {\n    "pin_id": "generated_[unique_id]",\n    "pin_title": "example title",\n    "pin_description": "full pin description (50-150 words)",\n    "save_count": number (realistic, 50-5000),\n    "hook_type": "sensory" | "benefit" | "curiosity" | "social_proof" | "urgency",\n    "top_words": ["word1", "word2", ...] (5-8 most impactful words),\n    "why_it_works": "1 sentence explanation",\n    "pattern": "the specific writing pattern to replicate"\n  }\n]\n\nReturn as JSON array.`,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!aiRes.ok) continue;
      const aiData = await aiRes.json();
      let content = aiData.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let pins: any[];
      try { pins = JSON.parse(content); } catch { continue; }

      for (const pin of pins) {
        const pinId = pin.pin_id || `gen_${category.replace(/\s/g, "_")}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        
        const { data: dup } = await supabase
          .from("pinterest_insights")
          .select("id")
          .eq("pin_id", pinId)
          .maybeSingle();
        if (dup) continue;

        await supabase.from("pinterest_insights").insert({
          pin_id: pinId,
          pin_title: pin.pin_title || "",
          pin_description: pin.pin_description,
          save_count: pin.save_count || 100,
          category,
          search_query: `${category} etsy`,
          extracted_patterns: { why_it_works: pin.why_it_works, pattern: pin.pattern },
          top_words: pin.top_words || [],
          hook_type: pin.hook_type || "benefit",
        });
        totalProcessed++;
      }

      // Generate category-level pattern summary
      const summaryRes = await fetch(AI_URL, {
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
              content: "Summarize Pinterest writing patterns. Respond with valid JSON only.",
            },
            {
              role: "user",
              content: `Summarize the top 5 writing rules for ${category} Pinterest pins that consistently drive saves. Return JSON: { "rules": ["rule1", "rule2", ...] }`,
            },
          ],
          temperature: 0.3,
        }),
      });

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        let summaryContent = summaryData.choices?.[0]?.message?.content || "";
        summaryContent = summaryContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        try {
          const summary = JSON.parse(summaryContent);
          await supabase.from("intelligence_cache").upsert({
            cache_key: `pinterest_patterns_${category.replace(/\s/g, "_")}`,
            data: summary,
            source: "pinterest",
            category,
            expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: "cache_key" });
        } catch {}
      }
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
