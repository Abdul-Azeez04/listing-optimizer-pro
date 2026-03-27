import { useState, useRef } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

const platforms: { value: Platform; label: string; colorClass: string }[] = [
  { value: 'etsy', label: 'Etsy', colorClass: 'border-platform-etsy bg-platform-etsy/10 text-platform-etsy' },
  { value: 'amazon', label: 'Amazon', colorClass: 'border-platform-amazon bg-platform-amazon/10 text-platform-amazon' },
  { value: 'shopify', label: 'Shopify', colorClass: 'border-platform-shopify bg-platform-shopify/10 text-platform-shopify' },
];

export default function RewritePage() {
  const { refreshProfile } = useAuth();
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

    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 200);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-listing', {
        body: input,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data as RewriteResult);
      // Refresh profile to get updated total_rewrites count
      refreshProfile();
    } catch (err) {
      const message = err instanceof Error && err.message.includes('timeout')
        ? 'CONVRT.AI is taking longer than usual. Please try again.'
        : 'Something went wrong generating your listing. Please try again.';
      toast({ title: message, variant: 'destructive' });
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
        <form onSubmit={handleSubmit} className="space-y-5">
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
