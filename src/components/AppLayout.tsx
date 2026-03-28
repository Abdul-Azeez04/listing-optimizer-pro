import { Outlet, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Sparkles, Clock, Settings, LogOut, Menu, X,
  MessageSquare, Mail, Lightbulb, Star, Swords, Eye, Rocket,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const toolItems = [
  { label: 'Listing Rewriter', path: '/rewrite', icon: Sparkles },
  { label: 'Social Captions', path: '/social', icon: MessageSquare },
  { label: 'Email Sequences', path: '/emails', icon: Mail },
  { label: 'Hook Generator', path: '/hooks', icon: Lightbulb },
  { label: 'Review Responder', path: '/reviews', icon: Star },
  { label: 'Competitor Analyzer', path: '/competitor', icon: Swords },
  { label: 'Business Setup', path: '/business-setup', icon: Rocket },
];

const accountItems = [
  { label: 'Intelligence', path: '/insights', icon: Eye },
  { label: 'History', path: '/history', icon: Clock },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const allNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ...toolItems,
  ...accountItems,
];

// Mobile bottom nav — show key items
const mobileNavItems = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Rewrite', path: '/rewrite', icon: Sparkles },
  { label: 'History', path: '/history', icon: Clock },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-60 flex-col border-r border-border bg-sidebar fixed inset-y-0 left-0 z-30">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="font-display font-bold text-xl text-primary">CONVRT</span>
            <span className="font-display font-bold text-xl text-foreground">.AI</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-4 overflow-y-auto">
          <Link
            to="/dashboard"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
              location.pathname === '/dashboard'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <div>
            <p className="px-3 text-xs text-muted-foreground uppercase tracking-wider mb-2">Tools</p>
            <div className="space-y-1">
              {toolItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}
                    className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="px-3 text-xs text-muted-foreground uppercase tracking-wider mb-2">Account</p>
            <div className="space-y-1">
              {accountItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}
                    className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground truncate mb-2">{user?.email}</div>
          <button onClick={signOut} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Tablet sidebar (icon only) */}
      <aside className="hidden md:flex lg:hidden w-14 flex-col items-center border-r border-border bg-sidebar fixed inset-y-0 left-0 z-30 py-4">
        <Link to="/dashboard" className="mb-6">
          <span className="font-display font-bold text-lg text-primary">C</span>
        </Link>
        <nav className="flex-1 space-y-2 overflow-y-auto">
          {allNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} title={item.label}
                className={cn('flex items-center justify-center w-10 h-10 rounded-md transition-colors',
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}>
                <item.icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur border-b border-border z-30 flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-1">
          <span className="font-display font-bold text-lg text-primary">CONVRT</span>
          <span className="font-display font-bold text-lg text-foreground">.AI</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-foreground">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile slide-out */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-background/80" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-card border-l border-border p-6 space-y-4 overflow-y-auto">
            {allNavItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                  className={cn('flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button onClick={signOut} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-8">
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur border-t border-border z-30 flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={cn('flex flex-col items-center gap-1 text-xs transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 lg:ml-60 md:ml-14 pt-14 md:pt-0 pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
