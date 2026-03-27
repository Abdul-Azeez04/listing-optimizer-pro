import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Mail, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const sequenceTypes = [
  { value: 'abandoned_cart', label: 'Abandoned Cart', color: 'border-yellow-500 bg-yellow-500/10 text-yellow-400' },
  { value: 'post_purchase', label: 'Post Purchase', color: 'border-green-500 bg-green-500/10 text-green-400' },
  { value: 'product_launch', label: 'Product Launch', color: 'border-blue-500 bg-blue-500/10 text-blue-400' },
  { value: 'win_back', label: 'Win Back', color: 'border-purple-500 bg-purple-500/10 text-purple-400' },
];

interface EmailItem { subject: string; body: string; }

export default function EmailsPage() {
  const { toast } = useToast();
  const [seqType, setSeqType] = useState('abandoned_cart');
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<EmailItem[] | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productDesc) {
      toast({ title: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setEmails(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-emails', {
        body: { sequence_type: seqType, product_name: productName, product_description: productDesc },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEmails(data.emails);
    } catch {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">Email Sequences</h1>
        <p className="text-muted-foreground">Generate automated email flows that convert.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="space-y-2">
            <Label>Sequence Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {sequenceTypes.map((s) => (
                <button key={s.value} type="button" onClick={() => setSeqType(s.value)}
                  className={cn('flex items-center justify-center py-3 rounded-lg border text-sm font-medium transition-all',
                    seqType === s.value ? s.color : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                  )}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input placeholder="e.g. Lavender Soy Candle" value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Product Description</Label>
            <Textarea placeholder="Describe your product..." value={productDesc} onChange={(e) => setProductDesc(e.target.value)} rows={4} className="resize-none" />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full h-14" disabled={loading}>
            <Mail className="h-5 w-5 mr-2" />
            {loading ? 'Generating...' : 'Generate Sequence'}
          </Button>
        </form>

        <div>
          {emails ? (
            <div className="space-y-4">
              {emails.map((email, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Email {idx + 1}</span>
                    <button onClick={() => copy(`${email.subject}\n\n${email.body}`, `email-${idx}`)}
                      className={cn('p-1.5 rounded transition-colors', copiedKey === `email-${idx}` ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                      {copiedKey === `email-${idx}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-sm font-medium">{email.subject}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{email.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <Mail className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">Fill in the form to generate an email sequence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
