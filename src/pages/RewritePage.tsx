import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import type { Platform, RewriteInput, RewriteResult } from '@/types';
import { RewriteLoading } from '@/components/rewrite/RewriteLoading';
import { RewriteOutput } from '@/components/rewrite/RewriteOutput';

const platforms: { value: Platform; label: string; colorClass: string }[] = [
  { value: 'etsy', label: 'Etsy', colorClass: 'border-platform-etsy bg-platform-etsy/10 text-platform-etsy' },
  { value: 'amazon', label: 'Amazon', colorClass: 'border-platform-amazon bg-platform-amazon/10 text-platform-amazon' },
  { value: 'shopify', label: 'Shopify', colorClass: 'border-platform-shopify bg-platform-shopify/10 text-platform-shopify' },
];

export default function RewritePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState<RewriteInput>({
    platform: 'etsy',
    category: '',
    original_title: '',
    original_description: '',
    target_buyer: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const descLength = input.original_description.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.category || !input.original_title || !input.target_buyer) {
      toast({ title: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    if (descLength < 100) {
      toast({ title: 'Description must be at least 100 characters.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);

    // Scroll to output on mobile
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 200);

    try {
      // Will call the edge function once Supabase is connected
      // For now, simulate with demo data after a delay
      await new Promise((r) => setTimeout(r, 8000));

      const demoResult: RewriteResult = {
        original_score: 34,
        original_score_breakdown: {
          hook_strength: 5,
          emotional_triggers: 3,
          keyword_placement: 10,
          specificity: 8,
          cta_clarity: 8,
        },
        variants: [
          {
            tone: 'emotional',
            title: `✨ ${input.original_title} — A Gift They'll Never Forget`,
            description: `Imagine unwrapping something made with love. ${input.original_description.slice(0, 200)}... This isn't just a product — it's a feeling.`,
            bullets: [
              'Handcrafted with premium materials for lasting quality',
              'The perfect gift for someone who deserves something special',
              'Each piece tells a story of artisan craftsmanship',
              'Designed to bring joy every time it\'s used',
              'Arrives beautifully packaged and ready to gift',
            ],
            tags: ['handmade', 'gift for her', 'unique gift', 'artisan', 'premium quality', 'bestseller', 'trending', 'must have', 'perfect gift', 'handcrafted'],
            score: 82,
            score_breakdown: { hook_strength: 18, emotional_triggers: 19, keyword_placement: 15, specificity: 14, cta_clarity: 16 },
            improvement_summary: 'Added emotional storytelling, gift-giving angle, and sensory language to connect with buyers on a personal level.',
          },
          {
            tone: 'analytical',
            title: `${input.original_title} | Premium Grade · Certified · 5-Star Rated`,
            description: `Specifications: ${input.original_description.slice(0, 200)}... Built to last with documented quality standards.`,
            bullets: [
              '100% premium materials — independently verified quality',
              'Dimensions: precisely crafted to standard specifications',
              '4.8★ average rating from 500+ verified buyers',
              'Ships in protective packaging within 24 hours',
              '30-day satisfaction guarantee — no questions asked',
            ],
            tags: ['premium', 'verified', 'top rated', 'quality assured', 'best seller', 'certified', 'professional', '5 star', 'guaranteed', 'fast shipping'],
            score: 79,
            score_breakdown: { hook_strength: 15, emotional_triggers: 12, keyword_placement: 18, specificity: 19, cta_clarity: 15 },
            improvement_summary: 'Added concrete specifications, social proof metrics, and trust signals to appeal to detail-oriented buyers.',
          },
          {
            tone: 'impulse',
            title: `🔥 ${input.original_title} — Selling Fast · Limited Stock`,
            description: `⚡ Over 200 sold this week. ${input.original_description.slice(0, 200)}... Don't miss out — order now before it's gone.`,
            bullets: [
              '🔥 TRENDING: Over 200 sold in the last 7 days',
              '⚡ LIMITED STOCK: Only a few left at this price',
              '⭐ Rated #1 in category by verified buyers',
              '🚀 Ships TODAY — order in the next 2 hours',
              '💯 100% satisfaction or your money back',
            ],
            tags: ['trending now', 'best seller', 'limited edition', 'hot item', 'must have', 'selling fast', 'popular', 'deal', 'top pick', 'viral'],
            score: 85,
            score_breakdown: { hook_strength: 19, emotional_triggers: 17, keyword_placement: 16, specificity: 15, cta_clarity: 18 },
            improvement_summary: 'Added urgency triggers, scarcity signals, and social proof to drive immediate purchase decisions.',
          },
        ],
      };

      setResult(demoResult);
    } catch {
      toast({
        title: 'Something went wrong generating your listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">New Rewrite</h1>
        <p className="text-muted-foreground">Paste your listing and let AI optimize it for conversion.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Platform selector */}
          <div className="space-y-2">
            <Label>Platform</Label>
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setInput({ ...input, platform: p.value })}
                  className={cn(
                    'flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-all',
                    input.platform === p.value
                      ? p.colorClass
                      : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Product Category</Label>
            <Input
              id="category"
              placeholder="e.g. handmade soy candles, sterling silver rings..."
              value={input.category}
              onChange={(e) => setInput({ ...input, category: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target Buyer</Label>
            <Input
              id="target"
              placeholder="e.g. women 25–40 who love minimalist home décor"
              value={input.target_buyer}
              onChange={(e) => setInput({ ...input, target_buyer: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Original Title</Label>
            <Input
              id="title"
              placeholder="Your current listing title"
              value={input.original_title}
              onChange={(e) => setInput({ ...input, original_title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Original Description</Label>
              <span className={cn(
                'text-xs font-mono',
                descLength < 100 ? 'text-score-low' : 'text-muted-foreground'
              )}>
                {descLength}/100 min
              </span>
            </div>
            <Textarea
              id="description"
              placeholder="Paste your current listing description here..."
              value={input.original_description}
              onChange={(e) => setInput({ ...input, original_description: e.target.value })}
              rows={6}
              className="resize-none"
            />
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full h-14"
            disabled={loading}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            {loading ? 'Analyzing...' : 'Analyze & Rewrite'}
          </Button>
        </form>

        {/* Output */}
        <div ref={outputRef}>
          {loading && <RewriteLoading />}
          {result && !loading && <RewriteOutput result={result} input={input} />}
          {!loading && !result && (
            <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <Sparkles className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">
                Fill in the form and hit "Analyze & Rewrite" to see your optimized listing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
