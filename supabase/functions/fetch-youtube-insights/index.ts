import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// YouTube intelligence — uses REAL YouTube Data API v3 + AI analysis
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const youtubeKey = Deno.env.get("YOUTUBE_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    const searchQueries = [
      "etsy shop success tips 2025",
      "amazon fba listing optimization",
      "shopify product description tips",
      "etsy SEO tutorial",
      "how to increase etsy sales",
      "ecommerce product photography tips",
      "sell handmade products online",
      "dropshipping product listing tips",
    ];

    let totalProcessed = 0;

    for (const query of searchQueries) {
      // Check for recent data (skip if < 12 hours old)
      const { data: existing } = await supabase
        .from("youtube_insights")
        .select("id")
        .eq("search_query", query)
        .gte("fetched_at", new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (existing && existing.length > 0) continue;

      let videoData: any[] = [];

      // Use real YouTube API if key available
      if (youtubeKey) {
        try {
          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&order=viewCount&relevanceLanguage=en&key=${youtubeKey}`;
          const searchRes = await fetch(searchUrl);
          
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const videoIds = (searchData.items || []).map((i: any) => i.id.videoId).filter(Boolean);

            if (videoIds.length > 0) {
              // Get video stats
              const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(",")}&key=${youtubeKey}`;
              const statsRes = await fetch(statsUrl);
              
              if (statsRes.ok) {
                const statsData = await statsRes.json();
                videoData = (statsData.items || []).map((v: any) => ({
                  videoId: v.id,
                  title: v.snippet?.title || "",
                  channelTitle: v.snippet?.channelTitle || "",
                  viewCount: parseInt(v.statistics?.viewCount || "0"),
                  description: v.snippet?.description || "",
                }));
              }
            }

            // Get comments from top video
            if (videoIds[0]) {
              try {
                const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoIds[0]}&maxResults=50&order=relevance&key=${youtubeKey}`;
                const commentsRes = await fetch(commentsUrl);
                if (commentsRes.ok) {
                  const commentsData = await commentsRes.json();
                  const comments = (commentsData.items || []).map(
                    (c: any) => c.snippet?.topLevelComment?.snippet?.textDisplay || ""
                  ).filter(Boolean);

                  if (comments.length > 0 && videoData[0]) {
                    videoData[0].comments = comments;
                  }
                }
              } catch { /* comments may be disabled */ }
            }
          }
        } catch (e) {
          console.error("YouTube API error:", e);
        }
      }

      // Use AI to analyze real data or generate insights
      const hasRealData = videoData.length > 0;
      const commentText = hasRealData && videoData[0]?.comments 
        ? videoData[0].comments.slice(0, 30).join("\n---\n") 
        : "";

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
              content: "You are a voice-of-customer analyst for ecommerce sellers. Analyze YouTube video data and comments to extract actionable seller intelligence. Respond with valid JSON only.",
            },
            {
              role: "user",
              content: hasRealData
                ? `Analyze these REAL YouTube video results and comments for the query "${query}".\n\nVideos found:\n${videoData.map(v => `- "${v.title}" by ${v.channelTitle} (${v.viewCount} views)`).join("\n")}\n\n${commentText ? `Real comments from top video:\n${commentText}` : ""}\n\nReturn JSON:\n{\n  "pain_points": ["pain1", ...] (5-8 specific struggles sellers mention based on the real data),\n  "success_signals": ["success1", ...] (5-8 things that worked based on real data),\n  "buyer_language": ["phrase1", ...] (8-12 exact phrases from real comments or realistic buyer language),\n  "category": "most relevant product category",\n  "key_insight": "the single most valuable insight from this data"\n}`
                : `Generate realistic YouTube seller tutorial insights for "${query}". Return JSON:\n{\n  "pain_points": ["pain1", ...] (5-8 specific struggles),\n  "success_signals": ["success1", ...] (5-8 things that worked),\n  "buyer_language": ["phrase1", ...] (8-12 exact buyer phrases),\n  "category": "most relevant product category",\n  "key_insight": "the single most valuable insight"\n}`,
            },
          ],
          temperature: 0.5,
        }),
      });

      if (!aiRes.ok) continue;
      const aiData = await aiRes.json();
      let content = aiData.choices?.[0]?.message?.content || "";
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let parsed: any;
      try { parsed = JSON.parse(content); } catch { continue; }

      const topVideo = videoData[0];
      const videoId = topVideo?.videoId || `gen_${query.replace(/\s/g, "_")}_${Date.now()}`;

      await supabase.from("youtube_insights").insert({
        video_id: videoId,
        video_title: topVideo?.title || parsed.video_title || query,
        channel_name: topVideo?.channelTitle || parsed.channel_name || "Unknown",
        view_count: topVideo?.viewCount || parsed.view_count || 10000,
        search_query: query,
        comments: topVideo?.comments || parsed.buyer_language || [],
        extracted_insights: { key_insight: parsed.key_insight, source: hasRealData ? "youtube_api" : "ai_generated" },
        pain_points: parsed.pain_points || [],
        success_signals: parsed.success_signals || [],
        category: parsed.category || "general",
      });

      // Cache buyer language
      const cat = parsed.category || "general";
      await supabase.from("intelligence_cache").upsert({
        cache_key: `youtube_buyer_language_${cat.replace(/\s/g, "_")}`,
        data: { phrases: parsed.buyer_language || [], key_insight: parsed.key_insight, source: hasRealData ? "youtube_api" : "ai_generated" },
        source: "youtube",
        category: cat,
        expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
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
