import { useHistory } from "./state/historyContext";
import History from "./pages/history";
import DiagnoseTab from "./pages/DiagnoseTab";
import Questions from "./pages/Questions";
import Results from "./pages/Results";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import React, { useState } from "react";
import OfflineBadge from "./components/OfflineBadge";

type Tab = "Diagnose" | "History" | "Connect" | "Results";
const tabs: Tab[] = ["Diagnose", "History", "Connect"];

function Splash({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold">Dogtor AI</h1>
      <p className="text-sm  text-gray-500 mt-1">
        Not a vet, just your first step.
      </p>
      <button
        onClick={onStart}
        className="mt-6 px-6 py-3 rounded-2xl bg-black text-white"
      >
        Get started
      </button>
      <p className="mt-4 text-xs text-gray-400">
        For guidance only. Not a veterinary service.
      </p>
    </div>
  );
}

function AppContent() {
  const [tab, setTab] = useState<Tab>("Diagnose");
  const [started, setStarted] = useState<boolean>(
    () => localStorage.getItem("hasStarted") === "1",
  );
  const location = useLocation();

  function begin() {
    localStorage.setItem("hasStarted", "1");
    setStarted(true);
  }

  // Hide navigation on question and result pages
  const hideNav = location.pathname.includes("/questions/") || location.pathname.includes("/results/");

  if (!started) return <Splash onStart={begin} />;

  return (
    <div className="min-h-dvh flex flex-col">
      <OfflineBadge />

      <Routes>
        <Route path="/" element={
          <>
            <header className="p-4 text-center font-bold">Dogtor AI</header>
            <main className="flex-1 p-4">
              <DiagnoseTab />
            </main>
          </>
        } />
        <Route path="/history" element={
          <>
            <header className="p-4 text-center font-bold">Dogtor AI</header>
            <main className="flex-1 p-4">
              <History />
            </main>
          </>
        } />
        <Route path="/connect" element={
          <>
            <header className="p-4 text-center font-bold">Dogtor AI</header>
            <main className="flex-1 p-4">
              <ConnectTab />
            </main>
          </>
        } />
        <Route path="/questions/:caseId" element={<Questions />} />
        <Route path="/results/:caseId" element={<Results />} />
      </Routes>

      {!hideNav && (
        <nav className="sticky bottom-0 inset-x-0 border-t bg-white">
          <div className="grid grid-cols-3 text-center">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  if (t === "Diagnose") window.location.href = "/";
                  else if (t === "History") window.location.href = "/history";
                  else if (t === "Connect") window.location.href = "/connect";
                }}
                className={`py-3 ${
                  (t === "Diagnose" && location.pathname === "/") ||
                  (t === "History" && location.pathname === "/history") ||
                  (t === "Connect" && location.pathname === "/connect")
                    ? "font-semibold" : "text-gray-500"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}