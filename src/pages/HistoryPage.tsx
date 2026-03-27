import { useState } from 'react';
import { Clock, ArrowRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Platform } from '@/types';

export default function HistoryPage() {
  const [filter, setFilter] = useState<Platform | 'all'>('all');

  // Placeholder - will fetch from Supabase
  const rewrites: {
    id: string;
    category: string;
    platform: Platform;
    original_score: number;
    best_score: number;
    created_at: string;
  }[] = [];

  const filtered = filter === 'all' ? rewrites : rewrites.filter((r) => r.platform === filter);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">History</h1>
        <p className="text-muted-foreground">All your past rewrites.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'etsy', 'amazon', 'shopify'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              filter === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No rewrites yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((rw) => (
            <div
              key={rw.id}
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-score-low">{rw.original_score}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-primary">{rw.best_score}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(rw.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
