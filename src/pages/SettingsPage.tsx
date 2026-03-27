import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Mic, Plus, X, Loader2 } from 'lucide-react';
import type { Platform, BrandVoiceTraits } from '@/types';

const platforms: { value: Platform; label: string }[] = [
  { value: 'etsy', label: 'Etsy' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'shopify', label: 'Shopify' },
];

export default function SettingsPage() {
  const { profile, updateProfile, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(profile?.full_name || '');
  const [platform, setPlatform] = useState<Platform | null>(profile?.primary_platform || null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  // Brand Voice
  const [showVoiceTraining, setShowVoiceTraining] = useState(false);
  const [samples, setSamples] = useState<string[]>(['', '', '']);
  const [brandDesc, setBrandDesc] = useState('');
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainedTraits, setTrainedTraits] = useState<BrandVoiceTraits | null>(
    (profile?.brand_voice_traits as BrandVoiceTraits) || null
  );

  const handleSaveProfile = async () => {
    await updateProfile({ full_name: name, primary_platform: platform });
    toast({ title: 'Profile updated.' });
  };

  const handleResetPassword = async () => {
    const email = profile?.email;
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) {
      toast({ title: 'Failed to send reset email. Try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Password reset email sent. Check your inbox.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    toast({ title: 'Account deletion requested. Contact support to complete.', variant: 'destructive' });
    signOut();
  };

  const addSample = () => {
    if (samples.length < 5) setSamples([...samples, '']);
  };

  const removeSample = (idx: number) => {
    if (samples.length <= 3) return;
    setSamples(samples.filter((_, i) => i !== idx));
  };

  const handleTrainVoice = async () => {
    const filledSamples = samples.filter((s) => s.trim().length > 20);
    if (filledSamples.length < 3) {
      toast({ title: 'Please provide at least 3 writing samples (min 20 chars each).', variant: 'destructive' });
      return;
    }
    setTrainingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('train-brand-voice', {
        body: { writing_samples: filledSamples, brand_description: brandDesc || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTrainedTraits(data as BrandVoiceTraits);
      setShowVoiceTraining(false);
      refreshProfile();
      toast({ title: 'Brand voice trained successfully!' });
    } catch {
      toast({ title: 'Something went wrong training your voice. Please try again.', variant: 'destructive' });
    } finally {
      setTrainingLoading(false);
    }
  };

  return (
    <div className="space-y-8 fade-in max-w-lg">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your account.</p>
      </div>

      {/* Profile */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Profile</h2>
        <div className="space-y-2">
          <Label htmlFor="settings-name">Full Name</Label>
          <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Primary Platform</Label>
          <div className="flex gap-2">
            {platforms.map((p) => (
              <button key={p.value} onClick={() => setPlatform(p.value)}
                className={cn('px-4 py-2 text-sm rounded-md border transition-colors',
                  platform === p.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                )}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <Button variant="hero" size="sm" onClick={handleSaveProfile}>Save changes</Button>
      </section>

      {/* Brand Voice */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg">Brand Voice</h2>
          {trainedTraits && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Active</span>
          )}
        </div>

        {trainedTraits && !showVoiceTraining ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Tone</span>
                <p className="text-sm font-medium mt-0.5">{trainedTraits.tone}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Personality</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {trainedTraits.personality.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded bg-muted text-foreground">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Vocabulary</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {trainedTraits.vocabulary.map((w) => (
                    <span key={w} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{w}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Avoid</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {trainedTraits.avoid.map((w) => (
                    <span key={w} className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive">{w}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Sentence Style</span>
                <p className="text-sm mt-0.5">{trainedTraits.sentence_style}</p>
              </div>
              {trainedTraits.example_phrase && (
                <div>
                  <span className="text-xs text-muted-foreground">Example</span>
                  <p className="text-sm italic mt-0.5">"{trainedTraits.example_phrase}"</p>
                </div>
              )}
            </div>
            <Button variant="surface" size="sm" onClick={() => setShowVoiceTraining(true)}>
              <Mic className="h-4 w-4 mr-1" /> Retrain
            </Button>
          </div>
        ) : !showVoiceTraining ? (
          <div>
            <p className="text-sm text-muted-foreground mb-3">Train CONVRT.AI to write in your voice.</p>
            <Button variant="hero" size="sm" onClick={() => setShowVoiceTraining(true)}>
              <Mic className="h-4 w-4 mr-1" /> Train Your Brand Voice
            </Button>
          </div>
        ) : null}

        {showVoiceTraining && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste 3–5 examples of your own writing below. Listing descriptions, social captions, product page copy — anything you've written for your shop.
            </p>
            {samples.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Sample {idx + 1}</Label>
                  {samples.length > 3 && (
                    <button onClick={() => removeSample(idx)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <Textarea
                  placeholder="Paste your writing here..."
                  value={s}
                  onChange={(e) => {
                    const updated = [...samples];
                    updated[idx] = e.target.value;
                    setSamples(updated);
                  }}
                  rows={3}
                  className="resize-none"
                />
              </div>
            ))}
            {samples.length < 5 && (
              <button onClick={addSample} className="text-xs text-primary flex items-center gap-1 hover:underline">
                <Plus className="h-3 w-3" /> Add another sample
              </button>
            )}
            <div className="space-y-1">
              <Label className="text-xs">Describe your brand in one sentence (optional)</Label>
              <Input value={brandDesc} onChange={(e) => setBrandDesc(e.target.value)} placeholder="e.g. We make hand-poured soy candles with a focus on mindfulness" />
            </div>
            <div className="flex gap-2">
              <Button variant="hero" size="sm" onClick={handleTrainVoice} disabled={trainingLoading}>
                {trainingLoading ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Analyzing...</> : 'Analyze My Voice'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowVoiceTraining(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </section>

      {/* Security */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Security</h2>
        <p className="text-sm text-muted-foreground">We'll send a reset link to your email.</p>
        <Button variant="surface" size="sm" onClick={handleResetPassword}>Reset Password</Button>
      </section>

      {/* Danger Zone */}
      <section className="bg-card border border-destructive/30 rounded-lg p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg text-destructive">Danger Zone</h2>
        {!showDelete ? (
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>Delete Account</Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Type <span className="font-mono text-foreground">DELETE</span> to confirm.
            </p>
            <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="Type DELETE" />
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE'}>Permanently Delete</Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}>Cancel</Button>
            </div>
          </div>
        )}
      </section>

      <Button variant="ghost" className="text-muted-foreground" onClick={signOut}>Log out</Button>
    </div>
  );
}
