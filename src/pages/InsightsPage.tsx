import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RefreshCw, TrendingUp, TrendingDown, Eye, MessageSquare,
  Sparkles, AlertTriangle, Lightbulb, Target, Zap, Hash, Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type InsightData = {
  category: string;
  platform: string;
  reddit_wins: any[];
  reddit_fails: any[];
  reddit_tips: any[];
  pinterest_patterns: any[];
  pinterest_summaries: any[];
  youtube_pain_points: string[];
  youtube_buyer_language: string[];
  youtube_success_signals: string[];
  etsy_patterns: any[];
  last_updated: string;
};

export default function InsightsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: insights, isLoading, refetch } = useQuery<InsightData>({
    queryKey: ['personalized-insights'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('get-personalized-insights', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Social intelligence (Facebook/Instagram)
  const { data: socialIntel } = useQuery({
    queryKey: ['social-intelligence'],
    queryFn: async () => {
      const { data } = await supabase
        .from('intelligence_cache')
        .select('*')
        .eq('source', 'social_media')
        .limit(3);
      return data || [];
    },
    enabled: !!user,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast({ title: 'Intelligence refreshed', description: 'Latest data loaded.' });
  };

  const timeSinceUpdate = insights?.last_updated
    ? Math.round((Date.now() - new Date(insights.last_updated).getTime()) / (1000 * 60 * 60))
    : null;

  if (isLoading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const hasData = insights && (
    insights.reddit_wins.length > 0 ||
    insights.pinterest_patterns.length > 0 ||
    insights.youtube_pain_points.length > 0 ||
    insights.etsy_patterns.length > 0
  );

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Intelligence Feed
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {timeSinceUpdate !== null ? `Updated ${timeSinceUpdate}h ago` : 'Loading...'}{' '}
            · Personalized for <span className="text-primary">{insights?.category || 'your'}</span> sellers
            on <span className="text-primary capitalize">{insights?.platform || 'all platforms'}</span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || (timeSinceUpdate !== null && timeSinceUpdate < 2)}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {!hasData ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Building Intelligence for {insights?.category || 'Your Category'}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              We're gathering data from Reddit, Pinterest, YouTube, and Etsy for your niche.
              Check back in 24 hours — or update your category in Settings.
            </p>
            <Button variant="outline" onClick={() => navigate('/settings')}>
              Update Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* SECTION 1 — Reddit Intelligence */}
          {(insights.reddit_wins.length > 0 || insights.reddit_fails.length > 0) && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="font-display text-lg">What Sellers Say Is Working</CardTitle>
                  <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-400 border-orange-500/30">
                    Reddit
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wins */}
                {insights.reddit_wins.length > 0 && (
                  <div className="space-y-3">
                    {insights.reddit_wins.map((win: any, i: number) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-foreground font-medium">{win.post_title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {win.extracted_insights?.actionable_takeaway || 'Actionable insight from this post'}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {(win.keywords || []).slice(0, 3).map((kw: string, j: number) => (
                              <Badge key={j} variant="secondary" className="text-[10px]">{kw}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fails */}
                {insights.reddit_fails.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-3">
                      <TrendingDown className="h-4 w-4" /> What's Not Working
                    </h3>
                    <div className="space-y-2">
                      {insights.reddit_fails.map((fail: any, i: number) => (
                        <div key={i} className="flex gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm text-foreground">{fail.post_title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {fail.extracted_insights?.actionable_takeaway || 'Avoid this pattern'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* SECTION 2 — Pinterest Patterns */}
          {insights.pinterest_patterns.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="font-display text-lg">Pinterest Patterns That Get Saves</CardTitle>
                    <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/30">
                      Pinterest
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {insights.pinterest_patterns.map((pin: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="text-[10px] capitalize bg-primary/20 text-primary border-0">
                          {pin.hook_type || 'benefit'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{pin.save_count} saves</span>
                      </div>
                      <p className="text-sm text-foreground">
                        {pin.extracted_patterns?.why_it_works || pin.pin_title || 'Pattern insight'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {pin.extracted_patterns?.pattern || ''}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Top words */}
                {insights.pinterest_patterns.some((p: any) => p.top_words?.length > 0) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Words appearing in top-saved pins:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[...new Set(insights.pinterest_patterns.flatMap((p: any) => p.top_words || []))].slice(0, 15).map((word: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button size="sm" onClick={() => navigate('/social')} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Pinterest Caption Using These Patterns
                </Button>
              </CardContent>
            </Card>
          )}

          {/* SECTION 3 — YouTube Voice of Customer */}
          {(insights.youtube_pain_points.length > 0 || insights.youtube_buyer_language.length > 0) && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="font-display text-lg">Voice of Your Customer</CardTitle>
                  <Badge variant="outline" className="text-xs bg-red-600/10 text-red-500 border-red-600/30">
                    YouTube
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Pain Points */}
                  {insights.youtube_pain_points.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <Target className="h-4 w-4 text-destructive" /> Biggest Pain Points
                      </h3>
                      <ol className="space-y-2">
                        {insights.youtube_pain_points.map((point, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="text-muted-foreground font-mono text-xs mt-0.5">{i + 1}.</span>
                            <span className="text-foreground">{point}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Buyer Language */}
                  {insights.youtube_buyer_language.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <MessageSquare className="h-4 w-4 text-primary" /> Buyer Language
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {insights.youtube_buyer_language.map((phrase, i) => (
                          <Badge key={i} variant="outline" className="text-[11px] font-normal">
                            "{phrase}"
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 italic">
                        These phrases came from real comments on seller tutorial videos. Use them in your listings.
                      </p>
                    </div>
                  )}
                </div>

                <Button size="sm" variant="outline" onClick={() => navigate('/rewrite')} className="gap-2 mt-4">
                  <Zap className="h-4 w-4" />
                  Rewrite My Listing Using Buyer Language
                </Button>
              </CardContent>
            </Card>
          )}

          {/* SECTION 4.5 — Facebook/Instagram Intelligence */}
          {socialIntel && socialIntel.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="font-display text-lg">Social Media Marketing Intel</CardTitle>
                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                    Facebook
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-pink-500/10 text-pink-400 border-pink-500/30">
                    Instagram
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {socialIntel.map((intel: any, i: number) => {
                  const d = intel.data;
                  if (!d) return null;
                  return (
                    <div key={i} className="space-y-4">
                      <Badge variant="secondary" className="capitalize text-xs">{intel.category}</Badge>

                      {/* Instagram patterns */}
                      {d.instagram_patterns?.slice(0, 3).map((p: any, j: number) => (
                        <div key={j} className="p-3 rounded-lg bg-muted/30 border border-border">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="text-[10px] capitalize bg-pink-500/20 text-pink-400 border-0">
                              {p.content_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground">{p.pattern}</p>
                          {p.caption_hook && (
                            <p className="text-xs text-muted-foreground mt-1 italic">Hook: "{p.caption_hook}"</p>
                          )}
                        </div>
                      ))}

                      {/* Trending hashtags */}
                      {d.trending_hashtags?.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Hash className="h-3 w-3" /> Trending Hashtags
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {d.trending_hashtags.slice(0, 10).map((tag: string, j: number) => (
                              <Badge key={j} variant="outline" className="text-[10px] font-normal">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Best posting times */}
                      {d.best_posting_times?.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Best times: {d.best_posting_times.join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}

                <Button size="sm" onClick={() => navigate('/social')} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Social Captions
                </Button>
              </CardContent>
            </Card>
          )}

          {/* SECTION 4 — Etsy Bestseller Secrets */}
          {insights.etsy_patterns.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="font-display text-lg">What Bestsellers Do Differently</CardTitle>
                  <Badge variant="outline" className="text-xs bg-orange-600/10 text-orange-500 border-orange-600/30">
                    Etsy
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {insights.etsy_patterns.map((pattern: any, i: number) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize text-xs">{pattern.category}</Badge>
                    </div>

                    {/* Key rule */}
                    {pattern.bestseller_patterns?.emotional_triggers && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm font-medium text-primary flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" /> Key Rule
                        </p>
                        <p className="text-sm text-foreground mt-1">
                          {typeof pattern.bestseller_patterns === 'object'
                            ? (pattern.bestseller_patterns.title_patterns?.[0] || 'Use emotion-driven titles with clear benefits')
                            : 'Focus on emotional triggers and clear value propositions'}
                        </p>
                      </div>
                    )}

                    {/* Title structures */}
                    {pattern.top_title_structures?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Title Structures:</p>
                        <div className="space-y-1">
                          {pattern.top_title_structures.slice(0, 3).map((structure: string, j: number) => (
                            <p key={j} className="text-sm font-mono text-foreground bg-muted/30 px-3 py-1.5 rounded">
                              {structure}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keywords */}
                    {pattern.top_keywords?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Top Keywords:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {pattern.top_keywords.slice(0, 12).map((kw: string, j: number) => (
                            <Badge key={j} variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Avoid patterns */}
                    {pattern.low_performer_patterns?.avoid_patterns?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Patterns to Avoid:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {pattern.low_performer_patterns.avoid_patterns.slice(0, 5).map((p: string, j: number) => (
                            <Badge key={j} variant="outline" className="text-[10px] text-destructive border-destructive/30 bg-destructive/5">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <Button size="sm" onClick={() => navigate('/rewrite')} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Apply These Rules to My Listing
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
