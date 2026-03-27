import { useState } from 'react';
import { Copy, Check, ArrowUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { RewriteResult, RewriteInput, ScoreBreakdown } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  result: RewriteResult;
  input: RewriteInput;
}

function ScoreBar({ label, value, max = 20 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full progress-fill', pct >= 70 ? 'bg-primary' : pct >= 40 ? 'bg-score-mid' : 'bg-score-low')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ScoreBreakdownView({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <div className="space-y-2">
      <ScoreBar label="Hook Strength" value={breakdown.hook_strength} />
      <ScoreBar label="Emotional Triggers" value={breakdown.emotional_triggers} />
      <ScoreBar label="Keyword Placement" value={breakdown.keyword_placement} />
      <ScoreBar label="Specificity" value={breakdown.specificity} />
      <ScoreBar label="CTA Clarity" value={breakdown.cta_clarity} />
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 text-xs rounded transition-all duration-200',
        copied ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
      )}
      aria-label={`Copy ${label || 'text'}`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

const toneLabels = { emotional: 'Emotional', analytical: 'Analytical', impulse: 'Impulse' } as const;

export function RewriteOutput({ result, input }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const bestScore = Math.max(...result.variants.map((v) => v.score));
  const improvement = bestScore - result.original_score;
  const variant = result.variants[activeTab];

  const handleFeedback = async () => {
    if (rating === 0 || !user) return;
    // Find the rewrite ID by querying most recent
    const { data: rewriteData } = await supabase
      .from('rewrites')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (rewriteData) {
      await supabase.from('feedback').insert({
        user_id: user.id,
        rewrite_id: rewriteData.id,
        rating,
        comment: feedbackText || null,
      });
    }
    setFeedbackSent(true);
    toast({ title: 'Thanks for your feedback!' });
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-5 text-center">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Original</div>
          <div className="font-mono text-4xl font-bold text-score-low">{result.original_score}</div>
        </div>
        <div className="bg-card border border-primary/20 rounded-lg p-5 text-center">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Best Variant</div>
          <div className="font-mono text-4xl font-bold text-primary">{bestScore}</div>
          <div className="flex items-center justify-center gap-1 text-primary text-sm font-mono mt-1">
            <ArrowUp className="h-3 w-3" />
            +{improvement} points
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-sm font-medium mb-3">Original Score Breakdown</h3>
        <ScoreBreakdownView breakdown={result.original_score_breakdown} />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex border-b border-border">
          {result.variants.map((v, i) => (
            <button
              key={v.tone}
              onClick={() => setActiveTab(i)}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors border-b-2',
                activeTab === i
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {toneLabels[v.tone]}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-5" key={activeTab}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Conversion Score</span>
            <span className="font-mono text-2xl font-bold text-primary">{variant.score}</span>
          </div>

          <ScoreBreakdownView breakdown={variant.score_breakdown} />

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground italic">{variant.improvement_summary}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionLabel>Title</SectionLabel>
              <CopyButton text={variant.title} label="title" />
            </div>
            <p className="text-sm bg-muted/30 rounded p-3">{variant.title}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionLabel>Description</SectionLabel>
              <CopyButton text={variant.description} label="description" />
            </div>
            <p className="text-sm bg-muted/30 rounded p-3 whitespace-pre-wrap leading-relaxed">{variant.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionLabel>Bullet Points</SectionLabel>
              <CopyButton text={variant.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')} label="bullets" />
            </div>
            <ol className="text-sm bg-muted/30 rounded p-3 space-y-1.5 list-decimal list-inside">
              {variant.bullets.map((b, i) => (
                <li key={i} className="leading-relaxed">{b}</li>
              ))}
            </ol>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionLabel>Tags</SectionLabel>
              <CopyButton text={variant.tags.join(', ')} label="tags" />
            </div>
            <div className="flex flex-wrap gap-2">
              {variant.tags.map((tag) => (
                <span key={tag} className="text-xs bg-muted px-2.5 py-1 rounded">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!feedbackSent ? (
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-medium">How did CONVRT.AI do?</h3>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} className="transition-colors" aria-label={`Rate ${s} stars`}>
                <Star className={cn('h-6 w-6', s <= rating ? 'fill-primary text-primary' : 'text-muted')} />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Did you use this? Did it improve your sales?"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button variant="surface" size="sm" onClick={handleFeedback} disabled={rating === 0}>
            Submit Feedback
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-primary/20 rounded-lg p-5 text-center">
          <p className="text-sm text-primary">Thanks for your feedback! 🎉</p>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{children}</span>;
}
