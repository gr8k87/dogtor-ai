import { useState, useEffect } from "react";
import Splash from "./Splash";

const tabs = ["Diagnose", "History", "Connect"] as const;
type Tab = typeof tabs[number];

export default function App() {
  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem('hasStarted') === '1';
  });
  const [tab, setTab] = useState<Tab>("Diagnose");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleGetStarted = () => {
    localStorage.setItem('hasStarted', '1');
    setHasStarted(true);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!hasStarted) {
    return <Splash onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 text-center font-bold relative">
        Dogtor AI
        {!isOnline && (
          <span className="absolute top-2 right-4 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
            Offline
          </span>
        )}
      </header>
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
  );
}