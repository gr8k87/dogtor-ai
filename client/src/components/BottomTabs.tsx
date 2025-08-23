import React from "react";

interface BottomTabsProps {
  navigate: any;
  activeTab: 'diagnose' | 'history' | 'results';
}

export default function BottomTabs({ navigate, activeTab }: BottomTabsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 safe-area-pb">
      <div className="flex justify-around">
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
            activeTab === "diagnose"
              ? "text-primary bg-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <span>🏠</span>
            <span>Diagnose</span>
          </div>
        </button>
        <button
          onClick={() => navigate("/history")}
          className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
            activeTab === "history"
              ? "text-primary bg-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <span>📋</span>
            <span>History</span>
          </div>
        </button>
        <button
          onClick={() => navigate("/connect")}
          className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
            activeTab === "results"
              ? "text-primary bg-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          }`}
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