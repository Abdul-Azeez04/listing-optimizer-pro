import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MessageSquare, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const socialPlatforms = [
  { value: 'instagram', label: 'Instagram', color: 'border-pink-500 bg-pink-500/10 text-pink-400' },
  { value: 'tiktok', label: 'TikTok', color: 'border-cyan-500 bg-cyan-500/10 text-cyan-400' },
  { value: 'pinterest', label: 'Pinterest', color: 'border-red-500 bg-red-500/10 text-red-400' },
  { value: 'facebook', label: 'Facebook', color: 'border-blue-500 bg-blue-500/10 text-blue-400' },
];

export default function SocialPage() {
  const { toast } = useToast();
  const [platform, setPlatform] = useState('instagram');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<string[] | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !description) {
      toast({ title: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setCaptions(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-captions', {
        body: { platform, product_name: productName, product_description: description },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCaptions(data.captions);
    } catch {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">Social Captions</h1>
        <p className="text-muted-foreground">Generate scroll-stopping captions for every platform.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="space-y-2">
            <Label>Platform</Label>
            <div className="grid grid-cols-2 gap-3">
              {socialPlatforms.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPlatform(p.value)}
                  className={cn(
                    'flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-all',
                    platform === p.value ? p.color : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input id="product-name" placeholder="e.g. Lavender Soy Candle" value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-desc">Product Description</Label>
            <Textarea id="product-desc" placeholder="Describe your product..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="resize-none" />
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full h-14" disabled={loading}>
            <MessageSquare className="h-5 w-5 mr-2" />
            {loading ? 'Generating...' : 'Generate Captions'}
          </Button>
        </form>

        <div>
          {captions ? (
            <div className="space-y-4">
              {captions.map((caption, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Caption {idx + 1}</span>
                    <button
                      onClick={() => copyCaption(caption, idx)}
                      className={cn('p-1.5 rounded transition-colors', copiedIdx === idx ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
                    >
                      {copiedIdx === idx ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{caption}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">Fill in the form to generate captions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
