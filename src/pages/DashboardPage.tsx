import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sparkles, BarChart3, ShoppingBag, ArrowRight, Clock,
  MessageSquare, Mail, Lightbulb, Star, Swords, Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RewriteResult } from '@/types';

const tools = [
  { name: 'Listing Rewriter', desc: 'Rewrite listings for maximum conversion', icon: Sparkles, path: '/rewrite', color: 'text-primary' },
  { name: 'Social Captions', desc: 'Generate captions for every platform', icon: MessageSquare, path: '/social', color: 'text-blue-400' },
  { name: 'Email Sequences', desc: 'Automated email flows that convert', icon: Mail, path: '/emails', color: 'text-purple-400' },
  { name: 'Hook Generator', desc: 'Attention-grabbing opening lines', icon: Lightbulb, path: '/hooks', color: 'text-yellow-400' },
  { name: 'Review Responder', desc: 'Professional responses to reviews', icon: Star, path: '/reviews', color: 'text-orange-400' },
  { name: 'Competitor Analyzer', desc: 'Analyze and outperform competitors', icon: Swords, path: '/competitor', color: 'text-red-400' },
];

const tips = [
  "Listings with emotional hooks get 2.3x more clicks than feature-first titles.",
  "Using buyer language from reviews in your description increases conversion by 40%.",
  "The first 160 characters of your Etsy description appear in search — make them count.",
  "Tags should include long-tail keywords that buyers actually search for.",
  "Adding urgency words like 'limited' or 'handmade' can boost impulse purchases by 25%.",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const tipIndex = Math.floor(Date.now() / 86400000) % tips.length;

  const { data: recentRewrites = [] } = useQuery({
    queryKey: ['recent-rewrites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('rewrites')
        .select('id, category, platform, original_score, variants, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      return (data ?? []).map((rw) => {
        const variants = rw.variants as unknown as RewriteResult['variants'];
        const bestScore = Math.max(...variants.map((v) => v.score));
        return {
          id: rw.id,
          category: rw.category,
          platform: rw.platform,
          original_score: rw.original_score ?? 0,
          best_score: bestScore,
          created_at: rw.created_at,
        };
      });
    },
    enabled: !!user,
  });

  const avgImprovement = recentRewrites.length > 0
    ? Math.round(recentRewrites.reduce((sum, rw) => sum + (rw.best_score - rw.original_score), 0) / recentRewrites.length)
    : 0;

  const daysSinceJoined = profile?.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000)
    : 0;

  const stats = [
    { label: 'Total AI Runs', value: profile?.total_rewrites || 0, icon: Sparkles },
    { label: 'Avg. Improvement', value: avgImprovement > 0 ? `+${avgImprovement}` : '+0', icon: BarChart3 },
    { label: 'Listings Optimized', value: recentRewrites.length, icon: ShoppingBag },
    { label: 'Days Since Joined', value: daysSinceJoined, icon: Clock },
  ];

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">{getGreeting()}, {firstName} 👋</h1>
        <p className="text-muted-foreground">Ready to optimize some listings?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <stat.icon className="h-4 w-4" />
              {stat.label}
            </div>
            <div className="font-mono text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="bg-card border border-border rounded-lg p-5 hover:border-muted-foreground/30 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className={cn('mt-0.5', tool.color)}>
                  <tool.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Recent Activity</h2>
        {recentRewrites.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No activity yet. Try the Listing Rewriter!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentRewrites.map((rw) => (
              <Link
                key={rw.id}
                to="/history"
                className="flex items-center justify-between bg-card border border-border rounded-lg px-5 py-4 hover:border-muted-foreground/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'w-2 h-2 rounded-full',
                    rw.platform === 'etsy' ? 'bg-platform-etsy' :
                    rw.platform === 'amazon' ? 'bg-platform-amazon' : 'bg-platform-shopify'
                  )} />
                  <span className="text-sm font-medium">{rw.category}</span>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                    {rw.platform}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-score-low">{rw.original_score}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-primary">{rw.best_score}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {new Date(rw.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Tip */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-start gap-3">
          <Brain className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium mb-1">Quick Tip</h3>
            <p className="text-xs text-muted-foreground">{tips[tipIndex]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
