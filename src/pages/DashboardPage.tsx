import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, BarChart3, ShoppingBag, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  // Placeholder data - will be fetched from Supabase
  const stats = [
    {
      label: 'Total Rewrites',
      value: profile?.total_rewrites || 0,
      icon: Sparkles,
    },
    {
      label: 'Avg. Improvement',
      value: '+0 pts',
      icon: BarChart3,
    },
    {
      label: 'Primary Platform',
      value: profile?.primary_platform
        ? profile.primary_platform.charAt(0).toUpperCase() + profile.primary_platform.slice(1)
        : 'Not set',
      icon: ShoppingBag,
    },
  ];

  const recentRewrites: {
    id: string;
    category: string;
    platform: string;
    original_score: number;
    best_score: number;
    created_at: string;
  }[] = [];

  return (
    <div className="space-y-8 fade-in">
      {/* Greeting */}
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">
          Hey, {firstName} 👋
        </h1>
        <p className="text-muted-foreground">
          Ready to optimize some listings?
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-lg p-5"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <stat.icon className="h-4 w-4" />
              {stat.label}
            </div>
            <div className="font-mono text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* New Rewrite CTA */}
      <Link to="/rewrite">
        <Button variant="hero" size="lg" className="w-full sm:w-auto h-14 px-8">
          <Sparkles className="h-5 w-5 mr-2" />
          New Rewrite
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Link>

      {/* Recent Rewrites */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Recent Rewrites</h2>
        {recentRewrites.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No rewrites yet. Create your first one!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentRewrites.map((rw) => (
              <Link
                key={rw.id}
                to={`/history`}
                className="flex items-center justify-between bg-card border border-border rounded-lg px-5 py-4 hover:border-muted-foreground/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'w-2 h-2 rounded-full',
                    rw.platform === 'etsy' ? 'bg-platform-etsy' :
                    rw.platform === 'amazon' ? 'bg-platform-amazon' : 'bg-platform-shopify'
                  )} />
                  <span className="text-sm font-medium">{rw.category}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-score-low">{rw.original_score}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-primary">{rw.best_score}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
