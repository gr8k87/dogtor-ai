import { useHistory } from "./state/historyContext";
import History from "./pages/history";
import DiagnoseTab from "./pages/DiagnoseTab";
import ConnectTab from "./pages/ConnectTab";
import Questions from "./pages/Questions";
import Results from "./pages/Results";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Button } from "./components/ui/button";
import BottomTabs from "./components/BottomTabs";
import { ThemeProvider } from "./lib/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { ProfileButton } from "./components/ProfileButton";
import { AppIcons } from "./components/icons";
import { AuthProvider, useAuth } from "./lib/auth-provider";

import React, { useState, useEffect } from "react";
import OfflineBadge from "./components/OfflineBadge";

type Tab = "Diagnose" | "History" | "Connect" | "Results";
const tabs: Tab[] = ["Diagnose", "History", "Connect"];

// Demo user detection with sessionStorage persistence
const isDemoMode = () => {
  // Check sessionStorage first
  const storedDemo = sessionStorage.getItem("demo-mode");
  if (storedDemo === "true") {
    return true;
  }

  // Check URL parameters and paths
  const isDemo =
    new URLSearchParams(window.location.search).get("demo") === "true" ||
    window.location.pathname.includes("/demo");

  // If demo mode detected from URL, store it in sessionStorage
  if (isDemo) {
    sessionStorage.setItem("demo-mode", "true");
  }

  return isDemo;
};

function Splash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Auto-transition to login after 2.5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <AppIcons.logoVertical size={150} />
          </div>

          <div className="space-y-2">
            <p className="text-lg text-muted-foreground">
              Your first step before the vet.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <AppIcons.safety size={16} />
            <span>Smart guidance for your dog’s health.</span>
          </div>

          {/* Loading indicator */}
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            For guidance only. If you’re worried, always check with your vet.
          </p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const { user, session, loading, userProfile, isProfileComplete } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleSplashComplete() {
    setShowSplash(false);
  }

  // Handle auth success redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('auth') === 'success' && user && userProfile && !loading) {
      if (isProfileComplete()) {
        navigate("/", { replace: true });
      } else {
        navigate("/profile?incomplete=true", { replace: true });
      }
    }
  }, [user, userProfile, loading, isProfileComplete, location.search, navigate]);

  // Hide navigation on question, result, and auth pages
  const hideNav =
    location.pathname.includes("/questions/") ||
    location.pathname.includes("/results/") ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/profile" ||
    location.pathname === "/privacy-policy" ||
    location.pathname === "/terms-of-service";

  // Show splash screen first
  if (showSplash) return <Splash onComplete={handleSplashComplete} />;

  // If authentication status is still loading, show a loading screen
  if (loading && !isDemoMode()) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login (except for auth pages)
  if (
    !user &&
    !["/login", "/signup", "/privacy-policy", "/terms-of-service"].includes(location.pathname) &&
    !isDemoMode()
  ) {
    return <Login />;
  }

  // Check profile completion for authenticated users (not demo mode)
  if (user && !isDemoMode() && userProfile && !isProfileComplete()) {
    // Allow access to profile page and auth pages
    if (!["/profile", "/login", "/signup", "/privacy-policy", "/terms-of-service"].includes(location.pathname)) {
      // Redirect to profile with completion context
      navigate("/profile?incomplete=true", { replace: true });
      return null;
    }
  }

  // Helper function to determine the active tab for BottomTabs
  const getActiveTab = () => {
    if (location.pathname === "/") return "diagnose";
    if (location.pathname === "/history") return "history";
    if (location.pathname === "/connect") return "connect";
    return "diagnose"; // Default to diagnose
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <OfflineBadge />

      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />


        {/* Main App Routes */}
        <Route
          path="/"
          element={
            <>
              <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <AppIcons.logo size={48} className="text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <ProfileButton />
                    <ThemeToggle />
                  </div>
                </div>
              </header>
              <main className="flex-1 pb-20 overflow-y-auto">
                <DiagnoseTab />
              </main>
            </>
          }
        />
        <Route
          path="/history"
          element={
            <>
              <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <AppIcons.logo size={48} className="text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <ProfileButton />
                    <ThemeToggle />
                  </div>
                </div>
              </header>
              <main className="flex-1 pb-20 overflow-y-auto">
                <History />
              </main>
            </>
          }
        />
        <Route
          path="/connect"
          element={
            <>
              <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <AppIcons.logo size={48} className="text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <ProfileButton />
                    <ThemeToggle />
                  </div>
                </div>
              </header>
              <main className="flex-1 pb-20 overflow-y-auto">
                <ConnectTab />
              </main>
            </>
          }
        />
        <Route path="/questions/:caseId" element={<Questions />} />
        <Route path="/results/:caseId" element={<Results />} />
        {/* Demo Route */}
        <Route
          path="/demo"
          element={
            <>
              <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <AppIcons.logo size={48} className="text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <ProfileButton />
                    <ThemeToggle />
                  </div>
                </div>
              </header>
              <main className="flex-1 pb-20 overflow-y-auto">
                <DiagnoseTab />
              </main>
            </>
          }
        />
      </Routes>

      {!hideNav && (
        <BottomTabs navigate={navigate} activeTab={getActiveTab()} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}