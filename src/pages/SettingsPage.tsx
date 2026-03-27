import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Platform } from '@/types';

const platforms: { value: Platform; label: string }[] = [
  { value: 'etsy', label: 'Etsy' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'shopify', label: 'Shopify' },
];

export default function SettingsPage() {
  const { profile, updateProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(profile?.full_name || '');
  const [platform, setPlatform] = useState<Platform | null>(profile?.primary_platform || null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const handleSaveProfile = async () => {
    await updateProfile({ full_name: name, primary_platform: platform });
    toast({ title: 'Profile updated.' });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    // Will delete from Supabase
    toast({ title: 'Account deleted.', variant: 'destructive' });
    signOut();
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
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={cn(
                  'px-4 py-2 text-sm rounded-md border transition-colors',
                  platform === p.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <Button variant="hero" size="sm" onClick={handleSaveProfile}>Save changes</Button>
      </section>

      {/* Security */}
      <section className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Security</h2>
        <p className="text-sm text-muted-foreground">Password changes are handled via email reset.</p>
        <Button variant="surface" size="sm" onClick={() => toast({ title: 'Password reset email sent.' })}>
          Reset Password
        </Button>
      </section>

      {/* Danger Zone */}
      <section className="bg-card border border-destructive/30 rounded-lg p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg text-destructive">Danger Zone</h2>
        {!showDelete ? (
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
            Delete Account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Type <span className="font-mono text-foreground">DELETE</span> to confirm.
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
            />
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE'}>
                Permanently Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </section>

      <Button variant="ghost" className="text-muted-foreground" onClick={signOut}>
        Log out
      </Button>
    </div>
  );
}
