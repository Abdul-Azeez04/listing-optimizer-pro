import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Lightbulb, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function HooksPage() {
  const { toast } = useToast();
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [targetBuyer, setTargetBuyer] = useState('');
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState<string[] | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !description) {
      toast({ title: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setHooks(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-hooks', {
        body: { product_name: productName, product_description: description, target_buyer: targetBuyer },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setHooks(data.hooks);
    } catch {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">Hook Generator</h1>
        <p className="text-muted-foreground">Attention-grabbing opening lines for your listings.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input placeholder="e.g. Lavender Soy Candle" value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Product Description</Label>
            <Textarea placeholder="Describe your product..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="resize-none" />
          </div>
          <div className="space-y-2">
            <Label>Target Buyer (optional)</Label>
            <Input placeholder="e.g. women 25-40 who love home décor" value={targetBuyer} onChange={(e) => setTargetBuyer(e.target.value)} />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full h-14" disabled={loading}>
            <Lightbulb className="h-5 w-5 mr-2" />
            {loading ? 'Generating...' : 'Generate Hooks'}
          </Button>
        </form>

        <div>
          {hooks ? (
            <div className="space-y-3">
              {hooks.map((hook, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-3">
                  <p className="text-sm flex-1">{hook}</p>
                  <button onClick={() => copy(hook, idx)}
                    className={cn('p-1.5 rounded transition-colors shrink-0', copiedIdx === idx ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                    {copiedIdx === idx ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <Lightbulb className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">Fill in the form to generate hooks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
