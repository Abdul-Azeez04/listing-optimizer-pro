import { useState } from 'react';
import { Clock, ArrowRight, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RewriteOutput } from '@/components/rewrite/RewriteOutput';
import type { Platform, RewriteResult, RewriteInput } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface RewriteRow {
  id: string;
  category: string;
  platform: string;
  original_score: number | null;
  original_title: string;
  original_description: string;
  target_buyer: string;
  variants: unknown;
  created_at: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Platform | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: rewrites = [] } = useQuery({
    queryKey: ['rewrites-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('rewrites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return (data ?? []) as RewriteRow[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rewrites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewrites-history'] });
      queryClient.invalidateQueries({ queryKey: ['recent-rewrites'] });
      toast({ title: 'Rewrite deleted.' });
    },
  });

  const filtered = filter === 'all' ? rewrites : rewrites.filter((r) => r.platform === filter);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">History</h1>
        <p className="text-muted-foreground">All your past rewrites.</p>
      </div>

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

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No rewrites yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((rw) => {
            const variants = rw.variants as unknown as RewriteResult['variants'];
            const bestScore = Math.max(...variants.map((v) => v.score));
            const isExpanded = expandedId === rw.id;

            return (
              <div key={rw.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : rw.id)}
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
                      <span className="font-mono text-score-low">{rw.original_score ?? 0}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono text-primary">{bestScore}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(rw.created_at).toLocaleDateString()}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Delete rewrite"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete rewrite?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(rw.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border pt-5">
                    <RewriteOutput
                      result={{
                        original_score: rw.original_score ?? 0,
                        original_score_breakdown: variants[0]?.score_breakdown ?? { hook_strength: 0, emotional_triggers: 0, keyword_placement: 0, specificity: 0, cta_clarity: 0 },
                        variants,
                      }}
                      input={{
                        platform: rw.platform as Platform,
                        category: rw.category,
                        original_title: rw.original_title,
                        original_description: rw.original_description,
                        target_buyer: rw.target_buyer,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
