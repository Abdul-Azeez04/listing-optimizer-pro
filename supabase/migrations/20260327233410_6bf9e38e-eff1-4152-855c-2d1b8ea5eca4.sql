
-- Reddit insights table
CREATE TABLE IF NOT EXISTS public.reddit_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subreddit text NOT NULL,
  post_id text UNIQUE NOT NULL,
  post_title text NOT NULL,
  post_body text,
  upvotes integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  extracted_insights jsonb,
  insight_type text,
  relevant_categories text[],
  keywords text[],
  fetched_at timestamptz DEFAULT now()
);
ALTER TABLE public.reddit_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reddit insights" ON public.reddit_insights FOR SELECT TO anon, authenticated USING (true);

-- Pinterest insights table
CREATE TABLE IF NOT EXISTS public.pinterest_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id text UNIQUE NOT NULL,
  pin_title text,
  pin_description text NOT NULL,
  save_count integer DEFAULT 0,
  category text,
  search_query text,
  extracted_patterns jsonb,
  top_words text[],
  hook_type text,
  fetched_at timestamptz DEFAULT now()
);
ALTER TABLE public.pinterest_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read pinterest insights" ON public.pinterest_insights FOR SELECT TO anon, authenticated USING (true);

-- YouTube insights table
CREATE TABLE IF NOT EXISTS public.youtube_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL,
  video_title text NOT NULL,
  channel_name text,
  view_count integer DEFAULT 0,
  search_query text,
  comments jsonb,
  extracted_insights jsonb,
  pain_points text[],
  success_signals text[],
  category text,
  fetched_at timestamptz DEFAULT now()
);
ALTER TABLE public.youtube_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read youtube insights" ON public.youtube_insights FOR SELECT TO anon, authenticated USING (true);

-- Etsy listing data table
CREATE TABLE IF NOT EXISTS public.etsy_listing_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id text UNIQUE NOT NULL,
  shop_id text NOT NULL,
  title text NOT NULL,
  description text,
  tags text[],
  price decimal,
  quantity_sold integer DEFAULT 0,
  num_favorers integer DEFAULT 0,
  views integer DEFAULT 0,
  category text,
  performance_tier text,
  extracted_patterns jsonb,
  fetched_at timestamptz DEFAULT now()
);
ALTER TABLE public.etsy_listing_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read etsy listing data" ON public.etsy_listing_data FOR SELECT TO anon, authenticated USING (true);

-- Etsy category patterns table
CREATE TABLE IF NOT EXISTS public.etsy_category_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text UNIQUE NOT NULL,
  bestseller_patterns jsonb,
  low_performer_patterns jsonb,
  top_title_structures text[],
  top_keywords text[],
  avg_title_length integer,
  avg_description_length integer,
  emotional_trigger_frequency jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.etsy_category_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read etsy category patterns" ON public.etsy_category_patterns FOR SELECT TO anon, authenticated USING (true);
