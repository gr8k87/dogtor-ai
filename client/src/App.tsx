import { useState, useEffect } from "react";
import Splash from "./components/Splash";
import OfflineBadge from "./components/OfflineBadge";

const tabs = ["Diagnose", "History", "Connect"] as const;
type Tab = typeof tabs[number];

export default function App() {
  const [hasStarted, setHasStarted] = useState<boolean>(() => {
    return localStorage.getItem('hasStarted') === 'true';
  });
  const [tab, setTab] = useState<Tab>("Diagnose");

  const handleGetStarted = () => {
    localStorage.setItem('hasStarted', 'true');
    setHasStarted(true);
  };

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  if (!hasStarted) {
    return (
      <>
        <OfflineBadge />
        <Splash onGetStarted={handleGetStarted} />
      </>
    );
  }

  return (
    <>
      <OfflineBadge />
      <div className="min-h-screen flex flex-col">
        <header className="p-4 text-center font-bold">🐕 Dogtor AI</header>
        <main className="flex-1 p-4">
          {tab === "Diagnose" && <div>Diagnose (placeholder)</div>}
          {tab === "History" && <div>History (placeholder)</div>}
          {tab === "Connect" && <div>Connect to Vet (placeholder)</div>}
        </main>
        <nav className="sticky bottom-0 inset-x-0 border-t bg-white">
          <div className="grid grid-cols-3 text-center">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3 ${t===tab ? "font-semibold" : "text-gray-500"}`}
                aria-current={t===tab ? "page" : undefined}
              >
                {t}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}