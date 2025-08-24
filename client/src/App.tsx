import { useHistory } from "./state/historyContext";
import History from "./pages/history";
import DiagnoseTab from "./pages/DiagnoseTab";
import ConnectTab from "./pages/ConnectTab";
import Questions from "./pages/Questions";
import Results from "./pages/Results";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button";
import BottomTabs from "./components/BottomTabs";
import { ThemeProvider } from "./lib/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { AppIcons } from "./components/icons";

import React, { useState } from "react";
import OfflineBadge from "./components/OfflineBadge";

type Tab = "Diagnose" | "History" | "Connect" | "Results";
const tabs: Tab[] = ["Diagnose", "History", "Connect"];

function Splash({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <AppIcons.logo size={64} className="text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Dogtor AI</h1>
            <p className="text-lg text-muted-foreground">
              Not a vet, just your first step.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <AppIcons.safety size={16} />
            <span>AI-powered pet health guidance</span>
          </div>
          
          <Button
            onClick={onStart}
            size="lg"
            className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all"
            data-testid="button-get-started"
          >
            Get started
          </Button>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            For guidance only. Not a veterinary service.
          </p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [tab, setTab] = useState<Tab>("Diagnose");
  const [started, setStarted] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  function begin() {
    setStarted(true);
    navigate("/");
  }

  // Hide navigation on question and result pages
  const hideNav = location.pathname.includes("/questions/") || location.pathname.includes("/results/");

  if (!started) return <Splash onStart={begin} />;

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <OfflineBadge />

      <Routes>
        <Route path="/" element={
          <>
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <AppIcons.logo size={32} className="text-primary" />
                  <h1 className="text-xl font-bold">Dogtor AI</h1>
                </div>
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 pb-20 overflow-y-auto">
              <DiagnoseTab />
            </main>
          </>
        } />
        <Route path="/history" element={
          <>
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <AppIcons.logo size={32} className="text-primary" />
                  <h1 className="text-xl font-bold">Dogtor AI</h1>
                </div>
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 pb-20 overflow-y-auto">
              <History />
            </main>
          </>
        } />
        <Route path="/connect" element={
          <>
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <AppIcons.logo size={32} className="text-primary" />
                  <h1 className="text-xl font-bold">Dogtor AI</h1>
                </div>
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 pb-20 overflow-y-auto">
              <ConnectTab />
            </main>
          </>
        } />
        <Route path="/questions/:caseId" element={<Questions />} />
        <Route path="/results/:caseId" element={<Results />} />
      </Routes>

      {!hideNav && (
        <BottomTabs 
          navigate={navigate} 
          activeTab={
            location.pathname === "/" ? "diagnose" :
            location.pathname === "/history" ? "history" :
            location.pathname === "/connect" ? "results" : "diagnose"
          }
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" defaultColorTheme="default">
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}