import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { SplashScreen } from "@/components/splash-screen";
import { Navbar } from "@/components/layout/navbar";
import { useStudyStore } from "@/store/use-study-store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/">
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-white">
          <Navbar />
          <Landing />
        </div>
      </Route>
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { hasSeenSplash, setHasSeenSplash, checkStreak } = useStudyStore();

  useEffect(() => {
    // Check and update gamification streak on load
    checkStreak();
  }, [checkStreak]);

  return (
    <>
      {!hasSeenSplash && <SplashScreen onComplete={() => setHasSeenSplash(true)} />}
      
      {/* Show main app regardless, but splash sits on top based on z-index and conditional rendering */}
      <Router />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppContent />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
