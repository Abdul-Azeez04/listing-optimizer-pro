import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Search, Sparkles, Store, Share2, CheckCircle2,
  TrendingUp, AlertTriangle, ArrowRight, Star, Globe,
} from 'lucide-react';

type ToolType = 'niche_finder' | 'business_name' | 'store_setup' | 'social_setup';

export default function BusinessSetupPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ToolType>('niche_finder');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Form fields
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [budget, setBudget] = useState('low');
  const [location, setLocation] = useState('United States');
  const [category, setCategory] = useState('');
  const [platform, setPlatform] = useState('etsy');

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('business-setup-toolkit', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { tool_type: activeTab, interests, skills, budget, location, category, platform },
      });
      if (error) throw error;
      setResult(data);
      toast({ title: 'Results ready!' });
    } catch {
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const locations = [
    'United States', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Nigeria', 'India', 'Brazil', 'Japan',
  ];

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl">Business Setup Toolkit</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find your niche, name your brand, and set up your store — all powered by AI market intelligence.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as ToolType); setResult(null); }}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="niche_finder" className="gap-1.5 text-xs">
            <Search className="h-3.5 w-3.5" /> Niche Finder
          </TabsTrigger>
          <TabsTrigger value="business_name" className="gap-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5" /> Name Generator
          </TabsTrigger>
          <TabsTrigger value="store_setup" className="gap-1.5 text-xs">
            <Store className="h-3.5 w-3.5" /> Store Setup
          </TabsTrigger>
          <TabsTrigger value="social_setup" className="gap-1.5 text-xs">
            <Share2 className="h-3.5 w-3.5" /> Social Setup
          </TabsTrigger>
        </TabsList>

        {/* NICHE FINDER */}
        <TabsContent value="niche_finder" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Your Interests</Label>
                  <Textarea value={interests} onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g. crafting, candle making, jewelry, digital art..." rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Your Skills</Label>
                  <Textarea value={skills} onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. woodworking, graphic design, sewing..." rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Target Market</Label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Starting Budget</Label>
                  <select value={budget} onChange={(e) => setBudget(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option value="low">Low ($0–$200)</option>
                    <option value="medium">Medium ($200–$1,000)</option>
                    <option value="high">High ($1,000+)</option>
                  </select>
                </div>
              </div>
              <Button variant="hero" onClick={handleGenerate} disabled={loading || !interests}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Finding Niches...</> : <><Search className="h-4 w-4 mr-2" /> Find My Niche</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BUSINESS NAME */}
        <TabsContent value="business_name" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Category</Label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. handmade soy candles" />
                </div>
                <div className="space-y-2">
                  <Label>Brand Vibe</Label>
                  <Input value={interests} onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g. minimal, earthy, luxury, playful" />
                </div>
                <div className="space-y-2">
                  <Label>Target Market</Label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Platform</Label>
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option value="etsy">Etsy</option>
                    <option value="amazon">Amazon</option>
                    <option value="shopify">Shopify</option>
                    <option value="multi-platform">Multi-platform</option>
                  </select>
                </div>
              </div>
              <Button variant="hero" onClick={handleGenerate} disabled={loading || !category}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Names...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Business Names</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STORE SETUP */}
        <TabsContent value="store_setup" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option value="etsy">Etsy</option>
                    <option value="amazon">Amazon</option>
                    <option value="shopify">Shopify</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Product Category</Label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. handmade jewelry" />
                </div>
                <div className="space-y-2">
                  <Label>Your Location</Label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Budget</Label>
                  <select value={budget} onChange={(e) => setBudget(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option value="low">Low ($0–$200)</option>
                    <option value="medium">Medium ($200–$1,000)</option>
                    <option value="high">High ($1,000+)</option>
                  </select>
                </div>
              </div>
              <Button variant="hero" onClick={handleGenerate} disabled={loading || !category}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Building Guide...</> : <><Store className="h-4 w-4 mr-2" /> Generate Setup Guide</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOCIAL SETUP */}
        <TabsContent value="social_setup" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Category</Label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. handmade candles" />
                </div>
                <div className="space-y-2">
                  <Label>Target Market</Label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <Button variant="hero" onClick={handleGenerate} disabled={loading || !category}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Building Strategy...</> : <><Share2 className="h-4 w-4 mr-2" /> Generate Social Strategy</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* RESULTS */}
      {result && (
        <div className="space-y-4">
          {/* Niche Finder Results */}
          {activeTab === 'niche_finder' && result.recommended_niches && (
            <>
              <h2 className="font-display text-xl font-semibold">Recommended Niches</h2>
              <div className="grid gap-4">
                {result.recommended_niches.map((niche: any, i: number) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">{niche.niche}</h3>
                            <Badge variant={niche.competition === 'low' ? 'default' : niche.competition === 'medium' ? 'secondary' : 'destructive'}
                              className="text-[10px]">{niche.competition} competition</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{niche.why_it_fits}</p>
                          <div className="grid gap-2 sm:grid-cols-3 text-xs">
                            <div><span className="text-muted-foreground">Platform:</span> <span className="capitalize text-foreground">{niche.best_platform}</span></div>
                            <div><span className="text-muted-foreground">Startup:</span> <span className="text-foreground">{niche.startup_cost}</span></div>
                            <div><span className="text-muted-foreground">Potential:</span> <span className="text-primary">{niche.profit_potential}</span></div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {(niche.trending_products || []).map((p: string, j: number) => (
                              <Badge key={j} variant="outline" className="text-[10px]">{p}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-center shrink-0">
                          <div className="text-2xl font-bold text-primary">{niche.demand_score}</div>
                          <div className="text-[10px] text-muted-foreground">demand</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {result.action_plan && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader><CardTitle className="text-base">Your Action Plan</CardTitle></CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {result.action_plan.map((step: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Business Name Results */}
          {activeTab === 'business_name' && result.names && (
            <>
              <h2 className="font-display text-xl font-semibold">Name Ideas</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.names.map((n: any, i: number) => (
                  <Card key={i} className="bg-card border-border hover:border-primary/30 transition-colors">
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-display font-bold text-lg text-foreground">{n.name}</h3>
                        <Badge variant="outline" className="text-[10px] capitalize">{n.style}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground italic mb-2">"{n.tagline}"</p>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <p><Globe className="h-3 w-3 inline mr-1" />{n.domain_suggestion}</p>
                        <p>{n.instagram_handle}</p>
                      </div>
                      <p className="text-xs text-foreground mt-2">{n.why_it_works}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Store Setup Results */}
          {activeTab === 'store_setup' && result.setup_checklist && (
            <>
              <h2 className="font-display text-xl font-semibold">Setup Checklist</h2>
              <div className="space-y-3">
                {result.setup_checklist.map((step: any, i: number) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm text-foreground">{step.title}</h3>
                            <Badge variant={step.priority === 'critical' ? 'destructive' : step.priority === 'important' ? 'default' : 'secondary'}
                              className="text-[9px]">{step.priority}</Badge>
                            <span className="text-[10px] text-muted-foreground">{step.time_estimate}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {result.common_mistakes && (
                <Card className="bg-destructive/5 border-destructive/20">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Common Mistakes to Avoid</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.common_mistakes.map((m: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="text-destructive">✕</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Social Setup Results */}
          {activeTab === 'social_setup' && result.platform_priority && (
            <>
              <h2 className="font-display text-xl font-semibold">Your Social Strategy</h2>
              <div className="grid gap-4">
                {result.platform_priority.map((p: any, i: number) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-primary/20 text-primary border-0 text-xs">#{p.priority}</Badge>
                        <h3 className="font-semibold text-foreground">{p.platform}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{p.why}</p>
                      <div className="text-xs text-muted-foreground mb-2">Post {p.posting_frequency}</div>
                      <div className="bg-muted/30 rounded-md p-3 mb-3">
                        <p className="text-xs text-muted-foreground mb-1">Bio template:</p>
                        <p className="text-sm text-foreground">{p.bio_template}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">First 10 post ideas:</p>
                        <div className="space-y-1">
                          {(p.first_10_posts || []).slice(0, 5).map((post: string, j: number) => (
                            <div key={j} className="flex gap-2 text-xs">
                              <ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                              <span>{post}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {result.hashtag_strategy && (
                <Card className="bg-card border-border">
                  <CardHeader><CardTitle className="text-base">Hashtag Strategy</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {[...(result.hashtag_strategy.niche_hashtags || []), ...(result.hashtag_strategy.trending_hashtags || [])].slice(0, 20).map((tag: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
