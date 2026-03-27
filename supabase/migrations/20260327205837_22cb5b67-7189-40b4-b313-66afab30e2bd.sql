-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  primary_platform TEXT CHECK (primary_platform IN ('etsy', 'amazon', 'shopify')),
  total_rewrites INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create rewrites table
CREATE TABLE public.rewrites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('etsy', 'amazon', 'shopify')),
  category TEXT NOT NULL,
  original_title TEXT NOT NULL,
  original_description TEXT NOT NULL,
  target_buyer TEXT NOT NULL,
  original_score INTEGER CHECK (original_score >= 0 AND original_score <= 100),
  variants JSONB NOT NULL,
  selected_variant INTEGER CHECK (selected_variant IN (0, 1, 2)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rewrites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own rewrites" ON public.rewrites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewrites" ON public.rewrites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rewrites" ON public.rewrites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rewrites" ON public.rewrites
  FOR DELETE USING (auth.uid() = user_id);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rewrite_id UUID NOT NULL REFERENCES public.rewrites(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  reported_result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to auto-increment total_rewrites on profile
CREATE OR REPLACE FUNCTION public.increment_total_rewrites()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_rewrites = total_rewrites + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_rewrite_insert
  AFTER INSERT ON public.rewrites
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_total_rewrites();

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();