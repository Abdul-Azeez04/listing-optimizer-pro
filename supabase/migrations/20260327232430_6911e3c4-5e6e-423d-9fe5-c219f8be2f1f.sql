
-- Add new columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS product_category text,
  ADD COLUMN IF NOT EXISTS target_buyer text,
  ADD COLUMN IF NOT EXISTS brand_voice text,
  ADD COLUMN IF NOT EXISTS brand_voice_traits jsonb,
  ADD COLUMN IF NOT EXISTS brand_voice_trained_at timestamptz;

-- Add share_token and share_views to rewrites
ALTER TABLE public.rewrites 
  ADD COLUMN IF NOT EXISTS share_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS share_views integer DEFAULT 0;

-- Create social_captions table
CREATE TABLE IF NOT EXISTS public.social_captions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_name text NOT NULL,
  product_description text NOT NULL,
  captions jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.social_captions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own captions" ON public.social_captions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create email_sequences table
CREATE TABLE IF NOT EXISTS public.email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sequence_type text NOT NULL CHECK (sequence_type IN ('abandoned_cart','post_purchase','product_launch','win_back')),
  product_name text NOT NULL,
  emails jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own emails" ON public.email_sequences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create tool_outputs table
CREATE TABLE IF NOT EXISTS public.tool_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tool_type text NOT NULL,
  input_data jsonb NOT NULL,
  output_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.tool_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own outputs" ON public.tool_outputs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create intelligence_cache table
CREATE TABLE IF NOT EXISTS public.intelligence_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  source text,
  category text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.intelligence_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read intelligence cache" ON public.intelligence_cache FOR SELECT TO anon, authenticated USING (true);

-- Public read policy for rewrites via share_token
CREATE POLICY "Public read via share token" ON public.rewrites FOR SELECT TO anon USING (share_token IS NOT NULL);

-- RPC to increment share views
CREATE OR REPLACE FUNCTION public.increment_share_views(token text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE rewrites SET share_views = share_views + 1 WHERE share_token = token;
$$;
