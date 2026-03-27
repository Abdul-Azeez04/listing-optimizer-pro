import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from '@/contexts/AuthContext';
import { PrefillProvider } from '@/contexts/PrefillContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const RewritePage = lazy(() => import('./pages/RewritePage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SocialPage = lazy(() => import('./pages/SocialPage'));
const EmailsPage = lazy(() => import('./pages/EmailsPage'));
const HooksPage = lazy(() => import('./pages/HooksPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const CompetitorPage = lazy(() => import('./pages/CompetitorPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const SharePage = lazy(() => import('./pages/SharePage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <PrefillProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/share/:token" element={<SharePage />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute><OnboardingPage /></ProtectedRoute>
                } />
                <Route element={
                  <ProtectedRoute><AppLayout /></ProtectedRoute>
                }>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/rewrite" element={<RewritePage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/social" element={<SocialPage />} />
                  <Route path="/emails" element={<EmailsPage />} />
                  <Route path="/hooks" element={<HooksPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/competitor" element={<CompetitorPage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </PrefillProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
