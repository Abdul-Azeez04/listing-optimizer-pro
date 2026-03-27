import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("product_category, primary_platform")
      .eq("id", user.id)
      .single();

    const category = profile?.product_category || "general";
    const platform = profile?.primary_platform || "etsy";

    // Fetch Reddit insights
    const { data: redditWins } = await supabase
      .from("reddit_insights")
      .select("*")
      .eq("insight_type", "what_worked")
      .order("fetched_at", { ascending: false })
      .limit(5);

    const { data: redditFails } = await supabase
      .from("reddit_insights")
      .select("*")
      .eq("insight_type", "what_failed")
      .order("fetched_at", { ascending: false })
      .limit(3);

    const { data: redditTips } = await supabase
      .from("reddit_insights")
      .select("*")
      .eq("insight_type", "tip")
      .order("fetched_at", { ascending: false })
      .limit(5);

    // Fetch Pinterest patterns
    const { data: pinterestPatterns } = await supabase
      .from("pinterest_insights")
      .select("*")
      .order("save_count", { ascending: false })
      .limit(5);

    // Fetch YouTube insights
    const { data: youtubeInsights } = await supabase
      .from("youtube_insights")
      .select("*")
      .order("fetched_at", { ascending: false })
      .limit(5);

    // Fetch Etsy patterns
    const { data: etsyPatterns } = await supabase
      .from("etsy_category_patterns")
      .select("*")
      .limit(8);

    // Get cached summaries
    const { data: pinterestCache } = await supabase
      .from("intelligence_cache")
      .select("*")
      .eq("source", "pinterest")
      .limit(5);

    const { data: youtubeCache } = await supabase
      .from("intelligence_cache")
      .select("*")
      .eq("source", "youtube")
      .limit(5);

    // Aggregate pain points and buyer language from YouTube
    const allPainPoints: string[] = [];
    const allBuyerLanguage: string[] = [];
    const allSuccessSignals: string[] = [];

    (youtubeInsights || []).forEach((insight: any) => {
      if (insight.pain_points) allPainPoints.push(...insight.pain_points);
      if (insight.success_signals) allSuccessSignals.push(...insight.success_signals);
    });

    (youtubeCache || []).forEach((cache: any) => {
      if (cache.data?.phrases) allBuyerLanguage.push(...cache.data.phrases);
    });

    const response = {
      category,
      platform,
      reddit_wins: redditWins || [],
      reddit_fails: redditFails || [],
      reddit_tips: redditTips || [],
      pinterest_patterns: pinterestPatterns || [],
      pinterest_summaries: pinterestCache || [],
      youtube_pain_points: [...new Set(allPainPoints)].slice(0, 8),
      youtube_buyer_language: [...new Set(allBuyerLanguage)].slice(0, 12),
      youtube_success_signals: [...new Set(allSuccessSignals)].slice(0, 8),
      etsy_patterns: etsyPatterns || [],
      last_updated: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
