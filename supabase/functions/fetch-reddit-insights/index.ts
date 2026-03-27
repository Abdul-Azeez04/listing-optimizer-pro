import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const subreddits = ["Etsy", "FulfillmentByAmazon", "shopify"];
    const filterKeywords = ["sales", "conversion", "listing", "views", "traffic", "what worked", "doubled", "increased", "tips", "advice", "help", "struggling"];

    let totalProcessed = 0;

    for (const sub of subreddits) {
      // Fetch hot posts using public JSON API (no auth needed)
      const urls = [
        `https://www.reddit.com/r/${sub}/hot.json?limit=25`,
        `https://www.reddit.com/r/${sub}/top.json?t=week&limit=25`,
      ];

      for (const url of urls) {
        let posts: any[] = [];
        try {
          const res = await fetch(url, {
            headers: { "User-Agent": "CONVRT.AI/1.0" },
          });
          if (!res.ok) continue;
          const data = await res.json();
          posts = data?.data?.children || [];
        } catch { continue; }

        // Filter relevant posts
        const relevant = posts.filter((p: any) => {
          const title = (p.data?.title || "").toLowerCase();
          return filterKeywords.some(kw => title.includes(kw));
        });

        for (const post of relevant.slice(0, 5)) {
          const d = post.data;
          const postId = d.id;

          // Check if already exists
          const { data: existing } = await supabase
            .from("reddit_insights")
            .select("id")
            .eq("post_id", postId)
            .maybeSingle();
          if (existing) continue;

          // Analyze with AI
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
                  content: "You are an ecommerce conversion intelligence analyst. Extract actionable seller insights from Reddit posts. Respond with valid JSON only.",
                },
                {
                  role: "user",
                  content: `Analyze this Reddit post from r/${sub} and extract ecommerce conversion insights.\n\nPOST TITLE: ${d.title}\nPOST BODY: ${(d.selftext || "").slice(0, 2000)}\n\nReturn JSON:\n{\n  "insight_type": "what_worked" | "what_failed" | "pain_point" | "tip" | "trend",\n  "actionable_takeaway": "one sentence",\n  "relevant_categories": ["category1"],\n  "keywords": ["keyword1", "keyword2"],\n  "confidence": 0.0-1.0\n}`,
                },
              ],
              temperature: 0.3,
            }),
          });

          if (!aiRes.ok) continue;
          const aiData = await aiRes.json();
          let content = aiData.choices?.[0]?.message?.content || "";
          content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

          let parsed: any;
          try { parsed = JSON.parse(content); } catch { continue; }

          await supabase.from("reddit_insights").insert({
            subreddit: sub,
            post_id: postId,
            post_title: d.title,
            post_body: (d.selftext || "").slice(0, 5000),
            upvotes: d.ups || 0,
            comment_count: d.num_comments || 0,
            extracted_insights: parsed,
            insight_type: parsed.insight_type || "tip",
            relevant_categories: parsed.relevant_categories || [],
            keywords: parsed.keywords || [],
          });
          totalProcessed++;
        }
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
