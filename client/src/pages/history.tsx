import { useEffect, useState } from "react";

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
      <div className="max-w-2xl mx-auto p-6 text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-sm text-red-600">{error}</div>
    );
  }

  if (!items.length) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-sm text-gray-500">
        No cases yet. Run a diagnosis first and it will appear here.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">History</h1>
      </div>

      {items.map((item) => (
        <HistoryCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function HistoryCard({ item }: { item: HistoryEntry }) {
  // right now we just show prompt/response
  // later, when your backend saves the full triage JSON, you can parse & render like before
  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <div className="text-xs text-gray-500">
        {new Date(item.created_at).toLocaleString()}
      </div>
      <div className="mt-2">
        <div className="text-gray-500 text-sm">Prompt:</div>
        <div className="text-sm">{item.prompt}</div>
      </div>
      <div className="mt-2">
        <div className="text-gray-500 text-sm">Response:</div>
        <pre className="bg-gray-50 p-2 rounded mt-1 overflow-x-auto text-xs">
          {item.response}
        </pre>
      </div>
    </div>
  );
}
