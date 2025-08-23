import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import BottomTabs from "../components/BottomTabs";

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

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this history record?")) {
      fetch(`/api/history/delete/${id}`, { method: "DELETE" })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to delete history");
          setItems(items.filter((item) => item.id !== id));
        })
        .catch((err) => {
          console.error("History delete error:", err);
          setError("Could not delete history");
        });
    }
  };

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
            <HistoryCard key={item.id} item={item} navigate={navigate} onDelete={handleDelete} />
          ))}
        </div>
      </main>

      <BottomTabs navigate={navigate} activeTab="history" />
    </div>
  );
}

function HistoryCard({ item, navigate, onDelete }: { item: HistoryEntry; navigate: any; onDelete: (id: string) => void }) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card 
      className={`transition-all ${cards ? 'cursor-pointer hover:shadow-md hover:border-gray-300' : ''}`}
      onClick={cards ? handleClick : undefined}
    >
      <CardContent>
        {cards ? (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">{formatDate(item.created_at)}</span>
                {cards.diagnosis?.urgency && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {cards.diagnosis.urgency.badge} {cards.diagnosis.urgency.level}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {cards.diagnosis?.likely_condition || "Analysis complete"}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {item.prompt}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-gray-400 ml-2">
                →
              </div>
              <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="text-red-500 hover:text-red-700">
                🗑️
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">{formatDate(item.created_at)}</div>
            <div className="text-sm font-medium text-gray-700">Raw Data</div>
            <div className="text-xs text-gray-600 truncate">{item.prompt}</div>
            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="text-red-500 hover:text-red-700">
              Delete
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

