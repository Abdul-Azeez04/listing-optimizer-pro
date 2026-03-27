import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Copy, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const demoOriginal = {
  title: "Handmade Soy Candle - Vanilla Scent",
  score: 34,
};

const demoRewrite = {
  title: "Hand-Poured Vanilla Soy Candle · 60hr Burn · Non-Toxic · Perfect Gift for Her",
  score: 87,
};

const steps = [
  { icon: Copy, title: "Paste your listing", desc: "Drop in your existing title and description from any platform." },
  { icon: Sparkles, title: "AI rewrites for conversion", desc: "Get 3 psychologically-optimized variants in seconds." },
  { icon: BarChart3, title: "Copy and publish", desc: "Choose the best variant, copy it, and watch conversions climb." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-display font-bold text-xl text-primary">CONVRT</span>
            <span className="font-display font-bold text-xl text-foreground">.AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs text-muted-foreground mb-8">
            <Sparkles className="h-3 w-3 text-primary" />
            Free for all sellers · No limits
          </div>
          <h1 className="font-display font-bold text-5xl md:text-7xl tracking-tight mb-6">
            Turn browsers into{' '}
            <span className="text-primary">buyers</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered listing rewriter built exclusively for Etsy, Amazon, and Shopify sellers.
            Rewrite once. Convert forever.
          </p>
          <Link to="/auth?mode=signup">
            <Button variant="hero" size="lg" className="h-14 px-10 text-base">
              Start rewriting — it's free
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>

          {/* Platform badges */}
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-platform-etsy" />
              Etsy
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-platform-amazon" />
              Amazon
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-platform-shopify" />
              Shopify
            </span>
          </div>
        </div>
      </section>

      {/* Before/After Demo */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-center mb-12">See the difference</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Before</span>
                <span className="font-mono text-2xl font-bold text-score-low">{demoOriginal.score}</span>
              </div>
              <p className="text-foreground text-sm leading-relaxed">{demoOriginal.title}</p>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-score-low rounded-full" style={{ width: `${demoOriginal.score}%` }} />
              </div>
            </div>
            {/* After */}
            <div className="bg-surface border border-primary/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">After</span>
                <span className="font-mono text-2xl font-bold text-primary">{demoRewrite.score}</span>
              </div>
              <p className="text-foreground text-sm leading-relaxed">{demoRewrite.title}</p>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${demoRewrite.score}%` }} />
              </div>
              <div className="mt-3 flex items-center gap-1 text-primary text-xs font-mono">
                <ArrowRight className="h-3 w-3 rotate-[-90deg]" />
                +{demoRewrite.score - demoOriginal.score} points
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="font-mono text-xs text-muted-foreground mb-2">0{i + 1}</div>
                <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl mb-4">Ready to convert?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of sellers already using CONVRT.AI to boost their listings.
          </p>
          <Link to="/auth?mode=signup">
            <Button variant="hero" size="lg" className="h-14 px-10">
              Sign up free
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-display font-bold text-primary">CONVRT</span>
            <span className="font-display font-bold">.AI</span>
          </div>
          <span>© {new Date().getFullYear()} CONVRT.AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
