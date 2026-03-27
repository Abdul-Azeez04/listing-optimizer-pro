import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Swords, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  suggested_improvements: string[];
}

export default function CompetitorPage() {
  const { toast } = useToast();
  const [competitorTitle, setCompetitorTitle] = useState('');
  const [competitorDesc, setCompetitorDesc] = useState('');
  const [yourTitle, setYourTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorTitle || !competitorDesc) {
      toast({ title: 'Please fill in competitor fields.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-competitor', {
        body: { competitor_title: competitorTitle, competitor_description: competitorDesc, your_title: yourTitle },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copy = (items: string[], key: string) => {
    navigator.clipboard.writeText(items.join('\n'));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sections = result ? [
    { key: 'strengths', label: 'Their Strengths', items: result.strengths, color: 'text-primary' },
    { key: 'weaknesses', label: 'Their Weaknesses', items: result.weaknesses, color: 'text-score-low' },
    { key: 'opportunities', label: 'Your Opportunities', items: result.opportunities, color: 'text-blue-400' },
    { key: 'improvements', label: 'Suggested Improvements', items: result.suggested_improvements, color: 'text-yellow-400' },
  ] : [];

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">Competitor Analyzer</h1>
        <p className="text-muted-foreground">Analyze competitor listings and find your edge.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleAnalyze} className="space-y-5">
          <div className="space-y-2">
            <Label>Competitor's Title</Label>
            <Input placeholder="Paste competitor listing title" value={competitorTitle} onChange={(e) => setCompetitorTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Competitor's Description</Label>
            <Textarea placeholder="Paste competitor listing description..." value={competitorDesc} onChange={(e) => setCompetitorDesc(e.target.value)} rows={5} className="resize-none" />
          </div>
          <div className="space-y-2">
            <Label>Your Title (optional)</Label>
            <Input placeholder="Your listing title for comparison" value={yourTitle} onChange={(e) => setYourTitle(e.target.value)} />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full h-14" disabled={loading}>
            <Swords className="h-5 w-5 mr-2" />
            {loading ? 'Analyzing...' : 'Analyze Competitor'}
          </Button>
        </form>

        <div>
          {result ? (
            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.key} className="bg-card border border-border rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={cn('text-sm font-medium', section.color)}>{section.label}</span>
                    <button onClick={() => copy(section.items, section.key)}
                      className={cn('p-1.5 rounded transition-colors', copiedKey === section.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                      {copiedKey === section.key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <ul className="space-y-1.5">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <Swords className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">Paste a competitor's listing to analyze it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
