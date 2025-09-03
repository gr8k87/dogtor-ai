import { useHistory } from "./state/historyContext";
import History from "./pages/history";
import DiagnoseTab from "./pages/DiagnoseTab";
import ConnectTab from "./pages/ConnectTab";
import Questions from "./pages/Questions";
import Results from "./pages/Results";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
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

import React, { useState, useEffect } from "react";
import OfflineBadge from "./components/OfflineBadge";

type Tab = "Diagnose" | "History" | "Connect" | "Results";
const tabs: Tab[] = ["Diagnose", "History", "Connect"];

function Splash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Auto-transition to login after 2 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <AppIcons.logoVertical size={80} />
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
  const [tab, setTab] = useState<Tab>("Diagnose");
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  function handleSplashComplete() {
    setShowSplash(false);
  }

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "";
      const response = await fetch(`${apiUrl}/api/auth/user`, {
        credentials: "include",
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  // Handle demo user access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("demo") === "true") {
      handleDemoAccess();
    }
  }, []);

  const handleDemoAccess = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "";
      const response = await fetch(`${apiUrl}/auth/demo`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setShowSplash(false);
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Demo access failed:", error);
    }
  };

  // Hide navigation on question, result, and auth pages
  const hideNav =
    location.pathname.includes("/questions/") ||
    location.pathname.includes("/results/") ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/profile";

  // Show splash screen first for all users
  if (showSplash) return <Splash onComplete={handleSplashComplete} />;

  // If authentication status is still loading, show a loading screen
  if (isAuthenticated === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login (except for auth pages)
  if (!isAuthenticated && !["/login", "/signup"].includes(location.pathname)) {
    return <Login />;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <OfflineBadge />

      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />

        {/* Main App Routes */}
        <Route
          path="/"
          element={
            <>
              <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <AppIcons.logo size={32} className="text-primary" />
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
                    <AppIcons.logo size={32} className="text-primary" />
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
                    <AppIcons.logo size={32} className="text-primary" />
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
      </Routes>

      {!hideNav && (
        <BottomTabs
          navigate={navigate}
          activeTab={
            location.pathname === "/"
              ? "diagnose"
              : location.pathname === "/history"
                ? "history"
                : location.pathname === "/connect"
                  ? "connect"
                  : "diagnose"
          }
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}