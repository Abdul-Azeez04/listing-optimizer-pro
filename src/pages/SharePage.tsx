import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowUp } from 'lucide-react';
import type { RewriteResult, Variant } from '@/types';

const scoreLabels: Record<string, string> = {
  hook_strength: 'Hook Strength',
  emotional_triggers: 'Emotional Triggers',
  keyword_placement: 'Keyword Placement',
  specificity: 'Specificity',
  cta_clarity: 'CTA Clarity',
};

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [rewrite, setRewrite] = useState<{
    platform: string;
    category: string;
    original_score: number;
    variants: Variant[];
  } | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data } = await supabase
        .from('rewrites')
        .select('platform, category, original_score, variants')
        .eq('share_token', token)
        .single();
      if (data) {
        setRewrite({
          platform: data.platform,
          category: data.category,
          original_score: data.original_score ?? 0,
          variants: data.variants as unknown as Variant[],
        });
        // Increment views
        await supabase.rpc('increment_share_views', { token });
      }
      setLoading(false);
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!rewrite) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display font-bold text-2xl mb-3">Result not found</h1>
          <p className="text-muted-foreground text-sm mb-6">This result has been removed or the link is invalid.</p>
          <Link to="/auth">
            <Button variant="hero">Sign up free</Button>
          </Link>
        </div>
      </div>
    );
  }

  const bestVariant = rewrite.variants.reduce((a, b) => a.score > b.score ? a : b);
  const improvement = bestVariant.score - rewrite.original_score;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center mb-2">
            <span className="font-display font-bold text-xl text-primary">CONVRT</span>
            <span className="font-display font-bold text-xl text-foreground">.AI</span>
          </div>
          <p className="text-xs text-muted-foreground">AI-powered listing optimizer for Etsy, Amazon & Shopify sellers</p>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-xs text-muted-foreground mb-2">Original Score</p>
            <p className="font-mono text-4xl font-bold text-score-low">{rewrite.original_score}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-xs text-muted-foreground mb-2">Optimized Score</p>
            <p className="font-mono text-4xl font-bold text-primary">{bestVariant.score}</p>
          </div>
        </div>

        {/* Improvement */}
        <div className="flex items-center justify-center gap-2">
          <ArrowUp className="h-5 w-5 text-primary" />
          <span className="font-mono text-lg font-bold text-primary">+{improvement} points</span>
        </div>

        {/* Badges */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
            Optimized for {rewrite.platform}
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
            {rewrite.category}
          </span>
        </div>

        {/* Score breakdown */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-3">
          <h3 className="text-sm font-medium mb-3">Score Breakdown</h3>
          {Object.entries(bestVariant.score_breakdown).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{scoreLabels[key] || key}</span>
                <span className="font-mono">{value}/20</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(value / 20) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-3">
          <h3 className="text-sm font-medium">{bestVariant.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{bestVariant.description.slice(0, 150)}...</p>
          <p className="text-xs text-primary">Sign up free to see the full optimized listing →</p>
        </div>

        {/* CTA */}
        <div className="bg-card border border-primary/30 rounded-lg p-8 text-center space-y-4">
          <h2 className="font-display font-bold text-xl">Get AI-optimized listings for your shop — free</h2>
          <p className="text-sm text-muted-foreground">
            Join thousands of Etsy, Amazon & Shopify sellers improving their conversion rates with CONVRT.AI
          </p>
          <Link to="/auth?source=share">
            <Button variant="hero" size="lg">Start Free — No Credit Card</Button>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Powered by CONVRT.AI
        </p>
      </div>
    </div>
  );
}
