
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// shape coming back from /api/history/list
export interface HistoryEntry {
  id: string;
  user_id: string;
  prompt: string;
  response: string;
  created_at: string;
}

export default function History() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/history/list")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load history");
        return res.json();
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("History fetch error:", err);
        setError("Could not load history");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col">
        <header className="p-4 text-center">
          <h1 className="font-bold">Dogtor AI</h1>
        </header>
        <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-20">
          <div className="text-sm text-gray-500">Loading...</div>
        </main>
        <BottomTabs navigate={navigate} activeTab="history" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col">
        <header className="p-4 text-center">
          <h1 className="font-bold">Dogtor AI</h1>
        </header>
        <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-20">
          <div className="text-sm text-red-600">{error}</div>
        </main>
        <BottomTabs navigate={navigate} activeTab="history" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-dvh flex flex-col">
        <header className="p-4 text-center">
          <h1 className="font-bold">Dogtor AI</h1>
        </header>
        <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-20">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-lg font-semibold mb-2">No History Yet</h2>
            <p className="text-gray-500 text-sm mb-6">
              Run a diagnosis first and it will appear here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Start Diagnosis
            </button>
          </div>
        </main>
        <BottomTabs navigate={navigate} activeTab="history" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="p-4 text-center">
        <h1 className="font-bold">Dogtor AI</h1>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">History</h2>
          <span className="text-sm text-gray-500">{items.length} cases</span>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <HistoryCard key={item.id} item={item} navigate={navigate} />
          ))}
        </div>
      </main>

      <BottomTabs navigate={navigate} activeTab="history" />
    </div>
  );
}

function HistoryCard({ item, navigate }: { item: HistoryEntry; navigate: any }) {
  let cards: any = null;
  try {
    cards = JSON.parse(item.response);
  } catch (e) {
    console.error("Failed to parse history response:", e);
    cards = null;
  }

  const handleClick = () => {
    if (cards) {
      navigate(`/results/history-${item.id}`, { state: { cards } });
    }
  };

  return (
    <div 
      className={`rounded-xl border p-4 shadow-sm transition-all ${cards ? 'cursor-pointer hover:shadow-md hover:border-gray-300' : ''}`}
      onClick={cards ? handleClick : undefined}
    >
      <div className="text-xs text-gray-500 mb-2">
        {new Date(item.created_at).toLocaleString()}
      </div>
      
      {cards ? (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">
            <strong>Symptoms:</strong> {item.prompt}
          </div>
          
          {/* Diagnosis Card Preview */}
          {cards.diagnosis && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="font-semibold text-sm mb-1">Diagnosis</h3>
              <p className="text-sm text-gray-700">
                <strong>Likely condition:</strong> {cards.diagnosis.likely_condition || "Analysis complete"}
              </p>
              {cards.diagnosis.urgency && (
                <p className="text-xs text-gray-600 mt-1">
                  {cards.diagnosis.urgency.badge} {cards.diagnosis.urgency.level} Urgency
                </p>
              )}
            </div>
          )}

          {/* Care Tips Preview */}
          {cards.care && cards.care.tips && (
            <div className="bg-blue-50 rounded-lg p-3">
              <h3 className="font-semibold text-sm mb-1">{cards.care.title || "Care Tips"}</h3>
              <p className="text-xs text-gray-600">
                {cards.care.tips.length} care recommendations available
              </p>
            </div>
          )}

          {/* Costs Preview */}
          {cards.costs && cards.costs.steps && (
            <div className="bg-green-50 rounded-lg p-3">
              <h3 className="font-semibold text-sm mb-1">{cards.costs.title || "Treatment Costs"}</h3>
              <p className="text-xs text-gray-600">
                {cards.costs.steps.length} cost estimates available
              </p>
            </div>
          )}

          <div className="text-xs text-blue-600 font-medium">Click to view full results →</div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-gray-500 text-sm">Prompt:</div>
          <div className="text-sm">{item.prompt}</div>
          <div className="text-gray-500 text-sm">Response:</div>
          <pre className="bg-gray-50 p-2 rounded mt-1 overflow-x-auto text-xs">
            {item.response}
          </pre>
        </div>
      )}
    </div>
  );
}

function BottomTabs({ navigate, activeTab }: { navigate: any; activeTab: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex">
        <button
          onClick={() => navigate("/")}
          className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
            activeTab === "diagnose" 
              ? "text-blue-600 bg-blue-50" 
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <span>🏠</span>
            <span>Diagnose</span>
          </div>
        </button>
        <button
          onClick={() => navigate("/history")}
          className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
            activeTab === "history" 
              ? "text-blue-600 bg-blue-50" 
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <span>📋</span>
            <span>History</span>
          </div>
        </button>
        <button
          className="flex-1 py-3 px-4 text-center text-sm font-medium text-gray-400"
          disabled
        >
          <div className="flex flex-col items-center gap-1">
            <span>🔗</span>
            <span>Connect</span>
          </div>
        </button>
      </div>
    </div>
  );
}
