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
    fetch("/api/history/list", {
      credentials: 'include'
    })
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
    if (
      window.confirm("Are you sure you want to delete this history record?")
    ) {
      fetch(`/api/history/delete/${id}`, { 
        method: "DELETE",
        credentials: 'include'
      })
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
      <div className="min-h-dvh flex flex-col gradient-hero">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-center px-4">

          </div>
        </header>
        <main className="flex-1 p-6 max-w-2xl mx-auto w-full pb-24">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border bg-card shadow-medium animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded-lg w-32"></div>
                    <div className="h-5 bg-muted rounded-lg w-48"></div>
                    <div className="h-3 bg-muted rounded-lg w-40"></div>
                  </div>
                  <div className="w-6 h-6 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </main>
        <BottomTabs navigate={navigate} activeTab="history" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col gradient-hero">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-center px-4">

          </div>
        </header>
        <main className="flex-1 p-6 max-w-2xl mx-auto w-full pb-24">
          <div className="text-center py-16">
            {/* Sad Dog Illustration for Error */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-destructive/10 to-destructive/5 flex items-center justify-center shadow-elevated">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 100 100"
                  className="text-destructive"
                >
                  <circle
                    cx="50"
                    cy="45"
                    r="25"
                    fill="currentColor"
                    opacity="0.1"
                  />
                  <circle cx="42" cy="40" r="3" fill="currentColor" />
                  <circle cx="58" cy="40" r="3" fill="currentColor" />
                  <ellipse cx="50" cy="48" rx="2" ry="3" fill="currentColor" />
                  <path
                    d="M45 54 Q50 50 55 54"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="35"
                    cy="35"
                    r="8"
                    fill="currentColor"
                    opacity="0.15"
                  />
                  <circle
                    cx="65"
                    cy="35"
                    r="8"
                    fill="currentColor"
                    opacity="0.15"
                  />
                  <path
                    d="M35 32 Q32 27 30 32"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M65 32 Q68 27 70 32"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-destructive">
                Oops! Something went wrong
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                We couldn't load your pet's history right now. Please try again.
              </p>
            </div>
            <div className="mt-8">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 font-semibold text-lg shadow-elevated hover:shadow-floating transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
        <BottomTabs navigate={navigate} activeTab="history" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-dvh flex flex-col gradient-hero">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-center px-4">

          </div>
        </header>
        <main className="flex-1 p-6 max-w-2xl mx-auto w-full pb-24">
          <div className="text-center py-16">
            {/* Friendly Dog Illustration */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-elevated">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 100 100"
                  className="text-primary"
                >
                  <circle
                    cx="50"
                    cy="45"
                    r="25"
                    fill="currentColor"
                    opacity="0.1"
                  />
                  <circle cx="42" cy="40" r="3" fill="currentColor" />
                  <circle cx="58" cy="40" r="3" fill="currentColor" />
                  <ellipse cx="50" cy="48" rx="2" ry="3" fill="currentColor" />
                  <path
                    d="M45 52 Q50 56 55 52"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="35"
                    cy="35"
                    r="8"
                    fill="currentColor"
                    opacity="0.15"
                  />
                  <circle
                    cx="65"
                    cy="35"
                    r="8"
                    fill="currentColor"
                    opacity="0.15"
                  />
                  <path
                    d="M35 30 Q32 25 30 30"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M65 30 Q68 25 70 30"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <ellipse
                    cx="50"
                    cy="65"
                    rx="15"
                    ry="8"
                    fill="currentColor"
                    opacity="0.08"
                  />
                  <path
                    d="M45 58 Q50 62 55 58"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">No records yet</h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Start your pet's first checkup! Your diagnosis history will
                appear here.
              </p>
            </div>
            <div className="mt-8">
              <button
                onClick={() => navigate("/")}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 font-semibold text-lg shadow-elevated hover:shadow-floating transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Start Your Pet's First Checkup
              </button>
            </div>
          </div>
        </main>
        <BottomTabs navigate={navigate} activeTab="history" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col gradient-hero">
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Pet Health History</h2>
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {items.length} records
          </span>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              navigate={navigate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </main>

      <BottomTabs navigate={navigate} activeTab="history" />
    </div>
  );
}

function HistoryCard({
  item,
  navigate,
  onDelete,
}: {
  item: HistoryEntry;
  navigate: any;
  onDelete: (id: string) => void;
}) {
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
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      className={`transition-all duration-300 border-accent rounded-2xl shadow-medium hover:shadow-elevated ${
        cards ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""
      }`}
      onClick={cards ? handleClick : undefined}
    >
      <CardContent className="p-6">
        {cards ? (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {formatDate(item.created_at)}
                </span>
                {cards.diagnosis?.urgency && (
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      cards.diagnosis.urgency.level === "High"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : cards.diagnosis.urgency.level === "Medium"
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : "bg-green-100 text-green-800 border border-green-200"
                    }`}
                  >
                    {cards.diagnosis.urgency.badge}{" "}
                    {cards.diagnosis.urgency.level}
                  </span>
                )}
              </div>
              <p className="text-lg font-semibold text-foreground truncate mb-1">
                {cards.diagnosis?.likely_condition || "Analysis complete"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {item.prompt}
              </p>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <div className="text-primary text-xl">→</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors duration-200"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground font-medium">
              {formatDate(item.created_at)}
            </div>
            <div className="text-lg font-semibold text-muted-foreground">
              Raw Data
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {item.prompt}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="text-destructive hover:text-destructive/80 font-medium text-sm px-3 py-1 rounded-lg hover:bg-destructive/10 transition-colors duration-200"
            >
              Delete Record
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
