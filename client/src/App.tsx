import { useHistory } from "./state/historyContext";
import History from "./pages/history";
import DiagnoseTab from "./pages/DiagnoseTab";
import ResultsTab from "./pages/ResultsTab";

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

export default function App() {
  const [tab, setTab] = useState<Tab>("Diagnose");
  const [started, setStarted] = useState<boolean>(
    () => localStorage.getItem("hasStarted") === "1",
  );
  const [currentResults, setCurrentResults] = useState<any>(null);

  function begin() {
    localStorage.setItem("hasStarted", "1");
    setStarted(true);
  }

  function handleResultsReady(cards: any) {
    setCurrentResults(cards);
    setTab("Results");
  }

  function handleBackToDiagnose() {
    setTab("Diagnose");
    setCurrentResults(null);
  }

  if (!started) return <Splash onStart={begin} />;

  return (
    <div className="min-h-dvh flex flex-col">
      <OfflineBadge />
      <header className="p-4 text-center font-bold">Dogtor AI</header>
      <main className="flex-1 p-4">
        {tab === "Diagnose" && <DiagnoseTab onResultsReady={handleResultsReady} />}
        {tab === "Results" && <ResultsTab cards={currentResults} onBack={handleBackToDiagnose} />}
        {tab === "History" && <History />}
        {tab === "Connect" && <div>Connect to Vet (placeholder)</div>}
      </main>
      {tab !== "Results" && (
        <nav className="sticky bottom-0 inset-x-0 border-t bg-white">
          <div className="grid grid-cols-3 text-center">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3 ${t === tab ? "font-semibold" : "text-gray-500"}`}
                aria-current={t === tab ? "page" : undefined}
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