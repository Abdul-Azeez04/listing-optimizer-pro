import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// YouTube intelligence - uses AI to generate realistic seller insight patterns
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const searchQueries = [
      "etsy shop success tips",
      "amazon fba listing optimization",
      "shopify product description tips",
      "etsy SEO tutorial",
      "product photography etsy tips",
      "how to increase etsy sales",
    ];

    let totalProcessed = 0;

    for (const query of searchQueries) {
      // Check for recent data
      const { data: existing } = await supabase
        .from("youtube_insights")
        .select("id")
        .eq("search_query", query)
        .gte("fetched_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (existing && existing.length > 0) continue;

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
              content: "You are a voice-of-customer analyst for ecommerce sellers. Generate realistic insights that would come from YouTube tutorial video comments. Respond with valid JSON only.",
            },
            {
              role: "user",
              content: `Generate realistic YouTube comment insights for the search query "${query}". Simulate analysis of a popular seller tutorial video.\n\nReturn JSON:\n{\n  "video_id": "gen_${Date.now()}",\n  "video_title": "realistic video title",\n  "channel_name": "realistic channel name",\n  "view_count": number,\n  "pain_points": ["pain1", "pain2", ...] (5-8 specific struggles sellers mention),\n  "success_signals": ["success1", ...] (5-8 things sellers say worked),\n  "buyer_language": ["phrase1", ...] (8-12 exact phrases sellers/buyers use),\n  "category": "most relevant product category",\n  "key_insight": "the single most valuable insight"\n}`,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!aiRes.ok) continue;
      const aiData = await aiRes.json();
      let content = aiData.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let parsed: any;
      try { parsed = JSON.parse(content); } catch { continue; }

      const videoId = parsed.video_id || `gen_${query.replace(/\s/g, "_")}_${Date.now()}`;

      await supabase.from("youtube_insights").insert({
        video_id: videoId,
        video_title: parsed.video_title || query,
        channel_name: parsed.channel_name || "Unknown",
        view_count: parsed.view_count || 10000,
        search_query: query,
        comments: parsed.buyer_language || [],
        extracted_insights: { key_insight: parsed.key_insight },
        pain_points: parsed.pain_points || [],
        success_signals: parsed.success_signals || [],
        category: parsed.category || "general",
      });

      // Cache buyer language
      const cat = parsed.category || "general";
      await supabase.from("intelligence_cache").upsert({
        cache_key: `youtube_buyer_language_${cat.replace(/\s/g, "_")}`,
        data: { phrases: parsed.buyer_language || [], key_insight: parsed.key_insight },
        source: "youtube",
        category: cat,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
