import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Platform } from '@/types';
import { ArrowRight, Check } from 'lucide-react';

const platforms: { value: Platform; label: string; color: string }[] = [
  { value: 'etsy', label: 'Etsy', color: 'bg-platform-etsy' },
  { value: 'amazon', label: 'Amazon', color: 'bg-platform-amazon' },
  { value: 'shopify', label: 'Shopify', color: 'bg-platform-shopify' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [category, setCategory] = useState('');
  const [targetBuyer, setTargetBuyer] = useState('');
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleComplete = async () => {
    await updateProfile({
      full_name: name,
      primary_platform: platform,
    });
    navigate('/dashboard');
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-1 justify-center mb-10">
          <span className="font-display font-bold text-2xl text-primary">CONVRT</span>
          <span className="font-display font-bold text-2xl text-foreground">.AI</span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-2 justify-center">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={cn(
                'h-1.5 rounded-full transition-all',
                s <= step ? 'bg-primary w-10' : 'bg-muted w-6'
              )}
            />
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mb-6">Step {step} of {totalSteps}</p>

        <div className="bg-card border border-border rounded-lg p-8 fade-in" key={step}>
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl mb-1">What's your name?</h2>
                <p className="text-sm text-muted-foreground">So we can personalize your experience.</p>
              </div>
              <Input
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
                autoFocus
              />
              <Button variant="hero" className="w-full h-11" onClick={() => setStep(2)} disabled={!name.trim()}>
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl mb-1">Which platform do you sell on?</h2>
                <p className="text-sm text-muted-foreground">We'll optimize for your marketplace.</p>
              </div>
              <div className="space-y-3">
                {platforms.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left',
                      platform === p.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <span className={cn('w-3 h-3 rounded-full', p.color)} />
                    <span className="font-medium">{p.label}</span>
                    {platform === p.value && <Check className="h-4 w-4 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
              <Button variant="hero" className="w-full h-11" onClick={() => setStep(3)} disabled={!platform}>
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl mb-1">What do you sell?</h2>
                <p className="text-sm text-muted-foreground">Tell us your product category so we can pre-fill your tools.</p>
              </div>
              <Input
                placeholder="e.g. handmade soy candles, sterling silver rings..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-12"
                autoFocus
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Who's your target buyer?</label>
                <Input
                  placeholder="e.g. women 25–40 who love minimalist home décor"
                  value={targetBuyer}
                  onChange={(e) => setTargetBuyer(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button variant="hero" className="w-full h-11" onClick={() => setStep(4)} disabled={!category.trim()}>
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
                <Check className="h-8 w-8" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl mb-1">You're all set, {name.split(' ')[0]}!</h2>
                <p className="text-sm text-muted-foreground">
                  Time to turn your {platform} listings into conversion machines.
                </p>
              </div>
              <Button variant="hero" className="w-full h-11" onClick={handleComplete}>
                Go to Dashboard <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
