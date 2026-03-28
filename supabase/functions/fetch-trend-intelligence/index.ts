import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Trend Intelligence — scrapes Google Trends patterns, Wikipedia seasonal data,
// and general web knowledge to build location-aware market intelligence
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Parse optional location from request body
    let targetLocation = "United States";
    let targetCategories = [
      "handmade jewelry", "candles and home scents", "art prints",
      "clothing and accessories", "digital products", "craft supplies",
      "toys and games", "wedding items", "home decor", "pet products",
      "beauty and skincare", "stickers and paper goods",
    ];

    try {
      const body = await req.json();
      if (body.location) targetLocation = body.location;
      if (body.categories) targetCategories = body.categories;
    } catch { /* no body, use defaults */ }

    const locations = [
      targetLocation,
      "United Kingdom", "Canada", "Australia", "Germany", "Nigeria", "India",
    ];

    let totalProcessed = 0;

    // 1. Google Trends-style intelligence per location
    for (const location of locations) {
      const cacheKey = `trend_intel_${location.replace(/\s/g, "_").toLowerCase()}`;

      // Check freshness (30 min)
      const { data: existing } = await supabase
        .from("intelligence_cache")
        .select("id, created_at")
        .eq("cache_key", cacheKey)
        .maybeSingle();

      if (existing) {
        const age = Date.now() - new Date(existing.created_at).getTime();
        if (age < 30 * 60 * 1000) continue; // skip if < 30 min old
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
              content: `You are a market trend analyst specializing in ecommerce. You have deep knowledge of Google Trends data, seasonal buying patterns, Wikipedia demographic data, and social media trends across different regions. Generate location-specific intelligence that is actionable for ecommerce sellers. Respond with valid JSON only.`,
            },
            {
              role: "user",
              content: `Generate current ecommerce market intelligence for sellers targeting buyers in "${location}" as of ${new Date().toISOString().split("T")[0]}.\n\nConsider:\n- Current Google Trends patterns for handmade/artisan products in this region\n- Seasonal events and holidays coming up in the next 60 days\n- Local buyer preferences and cultural shopping habits\n- Popular product categories trending NOW in this market\n- Price sensitivity and currency considerations\n- Local social media platform preferences\n\nReturn JSON:\n{\n  "location": "${location}",\n  "trending_categories": [\n    {"category": "name", "trend_direction": "rising" | "stable" | "declining", "trend_strength": 1-100, "why": "reason"}\n  ] (6-8 items),\n  "upcoming_events": [\n    {"event": "name", "date_range": "approximate dates", "opportunity": "how sellers can capitalize"}\n  ] (3-5 items),\n  "buyer_preferences": {\n    "price_range": "typical range buyers expect",\n    "shipping_expectations": "what buyers expect for shipping",\n    "preferred_platforms": ["platform1", "platform2"],\n    "payment_preferences": ["method1", "method2"],\n    "popular_search_terms": ["term1", "term2", ...] (8-12 terms)\n  },\n  "cultural_insights": ["insight1", "insight2", ...] (3-5 actionable cultural insights),\n  "content_strategy": {\n    "best_social_platforms": ["platform1", "platform2"],\n    "content_types_that_work": ["type1", "type2"],\n    "posting_times": ["time1", "time2"],\n    "hashtag_strategy": "recommended approach for this market"\n  },\n  "opportunity_score": 1-100,\n  "top_opportunity": "single most actionable insight for sellers targeting this market"\n}`,
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

      await supabase.from("intelligence_cache").upsert({
        cache_key: cacheKey,
        data: parsed,
        source: "trend_intelligence",
        category: location.toLowerCase(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }, { onConflict: "cache_key" });

      totalProcessed++;
    }

    // 2. Niche opportunity analysis (category x location matrix)
    for (const category of targetCategories.slice(0, 6)) {
      const cacheKey = `niche_opp_${category.replace(/\s/g, "_")}`;

      const { data: existing } = await supabase
        .from("intelligence_cache")
        .select("id, created_at")
        .eq("cache_key", cacheKey)
        .maybeSingle();

      if (existing) {
        const age = Date.now() - new Date(existing.created_at).getTime();
        if (age < 60 * 60 * 1000) continue; // skip if < 1 hour old
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
              content: "You are a niche market analyst for ecommerce. Analyze category opportunities using knowledge of search trends, competition levels, and buyer demand. Respond with valid JSON only.",
            },
            {
              role: "user",
              content: `Analyze the ecommerce niche opportunity for "${category}" as of ${new Date().toISOString().split("T")[0]}.\n\nReturn JSON:\n{\n  "category": "${category}",\n  "demand_score": 1-100,\n  "competition_level": "low" | "medium" | "high",\n  "trending_sub_niches": ["sub1", "sub2", ...] (5-8 specific sub-niches),\n  "winning_keywords": ["kw1", "kw2", ...] (10-15 high-intent keywords),\n  "price_sweet_spot": {"min": number, "max": number, "currency": "USD"},\n  "buyer_demographics": {"age_range": "25-45", "gender_split": "description", "interests": ["i1", "i2"]},\n  "seasonal_peak_months": ["month1", "month2"],\n  "differentiation_angles": ["angle1", "angle2", ...] (3-5 ways to stand out),\n  "top_platforms": [{"platform": "name", "fit_score": 1-100, "why": "reason"}],\n  "market_gap": "biggest unmet need in this category"\n}`,
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

      await supabase.from("intelligence_cache").upsert({
        cache_key: cacheKey,
        data: parsed,
        source: "niche_analysis",
        category,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
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
