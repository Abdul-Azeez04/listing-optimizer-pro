import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Star, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'empathetic', label: 'Empathetic' },
];

export default function ReviewsPage() {
  const { toast } = useToast();
  const [review, setReview] = useState('');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) {
      toast({ title: 'Please paste a review.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResponse(null);
    try {
      const { data, error } = await supabase.functions.invoke('respond-to-review', {
        body: { review_text: review, tone },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResponse(data.response);
    } catch {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">Review Responder</h1>
        <p className="text-muted-foreground">Professional responses to customer reviews in seconds.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="space-y-2">
            <Label>Customer Review</Label>
            <Textarea placeholder="Paste the customer review here..." value={review} onChange={(e) => setReview(e.target.value)} rows={6} className="resize-none" />
          </div>
          <div className="space-y-2">
            <Label>Response Tone</Label>
            <div className="flex gap-2">
              {tones.map((t) => (
                <button key={t.value} type="button" onClick={() => setTone(t.value)}
                  className={cn('px-4 py-2 text-sm rounded-md border transition-colors',
                    tone === t.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                  )}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full h-14" disabled={loading}>
            <Star className="h-5 w-5 mr-2" />
            {loading ? 'Generating...' : 'Generate Response'}
          </Button>
        </form>

        <div>
          {response ? (
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Your Response</span>
                <button onClick={copy}
                  className={cn('p-1.5 rounded transition-colors', copied ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-sm whitespace-pre-wrap">{response}</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <Star className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">Paste a review to generate a response.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
