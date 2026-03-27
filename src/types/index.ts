export type Platform = 'etsy' | 'amazon' | 'shopify';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  primary_platform: Platform | null;
  product_category: string | null;
  target_buyer: string | null;
  brand_voice: string | null;
  brand_voice_traits: BrandVoiceTraits | null;
  brand_voice_trained_at: string | null;
  total_rewrites: number;
  created_at: string;
}

export interface BrandVoiceTraits {
  tone: string;
  personality: string[];
  vocabulary: string[];
  avoid: string[];
  sentence_style: string;
  emotional_register: string;
  example_phrase?: string;
}

export interface ScoreBreakdown {
  hook_strength: number;
  emotional_triggers: number;
  keyword_placement: number;
  specificity: number;
  cta_clarity: number;
}

export interface Variant {
  tone: 'emotional' | 'analytical' | 'impulse';
  title: string;
  description: string;
  bullets: string[];
  tags: string[];
  score: number;
  score_breakdown: ScoreBreakdown;
  improvement_summary: string;
}

export interface RewriteResult {
  original_score: number;
  original_score_breakdown: ScoreBreakdown;
  variants: [Variant, Variant, Variant];
}

export interface Rewrite {
  id: string;
  user_id: string;
  platform: Platform;
  category: string;
  original_title: string;
  original_description: string;
  target_buyer: string;
  original_score: number | null;
  variants: RewriteResult['variants'];
  selected_variant: number | null;
  share_token: string | null;
  share_views: number;
  created_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  rewrite_id: string;
  rating: number;
  comment: string | null;
  reported_result: string | null;
  created_at: string;
}

export interface RewriteInput {
  platform: Platform;
  category: string;
  original_title: string;
  original_description: string;
  target_buyer: string;
}
