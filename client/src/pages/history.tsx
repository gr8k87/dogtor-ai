import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HealthCard,
  HealthCardContent,
  HealthCardHeader,
  HealthCardTitle,
} from "../components/ui/health-card";
import BottomTabs from "../components/BottomTabs";
import { supabase } from "../lib/supabase";
import { AppIcons, Delete } from "../components/icons";
import { useDogName } from "../lib/hooks";

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
  const dogName = useDogName();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Get the current session and token
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/history/list", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load history");
        }

        const data = await response.json();
        setItems(data);
        setLoading(false);
      } catch (err) {
        console.error("History fetch error:", err);
        setError("Could not load history");
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this history record?")
    ) {
      try {
        // Get the current session and token
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setError("Authentication required");
          return;
        }

        const response = await fetch(`/api/history/delete/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete history");
        }

        setItems(items.filter((item) => item.id !== id));
      } catch (err) {
        console.error("History delete error:", err);
        setError("Could not delete history");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col gradient-hero">
        <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-20">
          {/* Header Card */}
          <HealthCard colorIndex={2} className="mb-4">
            <HealthCardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
                <div className="h-5 bg-muted rounded-full w-16 animate-pulse"></div>
              </div>
            </HealthCardContent>
          </HealthCard>

          {/* History Cards Skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <HealthCard key={i} colorIndex={2} className="animate-pulse">
                <HealthCardContent className="p-1">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 bg-muted rounded w-20"></div>
                        <div className="h-4 bg-muted rounded-full w-16"></div>
                      </div>
                      <div className="h-4 bg-muted rounded w-40"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                    </div>
                    <div className="w-6 h-6 bg-muted rounded"></div>
                  </div>
                </HealthCardContent>
              </HealthCard>
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
        <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-20">
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
        <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-20">
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
              <h2 className="text-2xl font-bold"><span className="text-[#FF5A5F] font-bold tracking-tight" style={{fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'}}>{dogName}</span>'s health journey starts here</h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Start <span className="text-[#FF5A5F] font-bold tracking-tight" style={{fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'}}>{dogName}</span>'s first checkup! Your diagnosis history will
                appear here.
              </p>
            </div>
            <div className="mt-8">
              <button
                onClick={() => navigate("/")}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 font-semibold text-lg shadow-elevated hover:shadow-floating transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Start <span className="text-[#FF5A5F] font-bold tracking-tight" style={{fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'}}>{dogName}</span>'s First Checkup
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
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-20">
        {/* Header Card - now inside the layout with proper theming */}
        <HealthCard colorIndex={2} className="mb-4 border-accent">
          <HealthCardHeader className="pb-2">
            <HealthCardTitle className="flex items-center justify-between text-xl text-foreground">
              <div className="flex items-center gap-2">
                <AppIcons.history size={24} className="text-primary" />
                {dogName}'s previous checkups
              </div>
              <span className="text-sm font-normal text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {items.length} record{items.length !== 1 ? "s" : ""}
              </span>
            </HealthCardTitle>
          </HealthCardHeader>
        </HealthCard>

        {/* Compact History Cards */}
        <div className="space-y-3">
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
    <HealthCard
      colorIndex={2}
      className={`transition-all duration-200 border-accent !p-1 hover:shadow-medium ${
        cards ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]" : ""
      }`}
      onClick={cards ? handleClick : undefined}
    >
      <HealthCardContent className="p-4">
        {cards ? (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 space-y-1">
              {/* Compact header row */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground font-medium">
                  {formatDate(item.created_at)}
                </span>
                {cards.diagnosis?.urgency && (
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium text-xs ${
                      cards.diagnosis.urgency.level === "High"
                        ? "bg-destructive/10 text-destructive"
                        : cards.diagnosis.urgency.level === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {cards.diagnosis.urgency.level}
                  </span>
                )}
              </div>

              {/* Main condition - more compact */}
              <h3 className="font-semibold text-foreground text-sm leading-tight">
                {cards.diagnosis?.likely_condition || "Analysis complete"}
              </h3>

              {/* Symptoms - smaller and truncated */}
              <p className="text-xs text-muted-foreground truncate">
                {item.prompt}
              </p>
            </div>

            {/* Compact action buttons */}
            <div className="flex items-center gap-2 ml-3">
              <div className="text-primary">→</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200"
                title="Delete record"
              >
                <Delete size={14} />
              </button>
            </div>
          </div>
        ) : (
          // Raw data fallback - also more compact
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground font-medium mb-1">
                  {formatDate(item.created_at)}
                </div>
                <div className="text-sm font-semibold text-muted-foreground mb-1">
                  Raw Data
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {item.prompt}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200 ml-3"
                title="Delete record"
              >
                <Delete size={14} />
              </button>
            </div>
          </div>
        )}
      </HealthCardContent>
    </HealthCard>
  );
}
