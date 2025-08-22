
import React from "react";
import { Button } from "./ui/button";

interface BottomTabsProps {
  navigate: any;
  activeTab: 'diagnose' | 'history' | 'results';
}

export default function BottomTabs({ navigate, activeTab }: BottomTabsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 safe-area-pb">
      <div className="flex justify-around">
        <Button
          variant={activeTab === "diagnose" ? "default" : "ghost"}
          onClick={() => navigate("/")}
          className="flex flex-col items-center py-2 px-3 h-auto"
        >
          <div className="flex flex-col items-center gap-1">
            <span>🏠</span>
            <span className="text-xs">Diagnose</span>
          </div>
        </Button>
        <Button
          variant={activeTab === "history" ? "default" : "ghost"}
          onClick={() => navigate("/history")}
          className="flex flex-col items-center py-2 px-3 h-auto"
        >
          <div className="flex flex-col items-center gap-1">
            <span>📋</span>
            <span className="text-xs">History</span>
          </div>
        </Button>
        <Button
          variant={activeTab === "results" ? "default" : "ghost"}
          onClick={() => navigate("/results")}
          className="flex flex-col items-center py-2 px-3 h-auto"
        >
          <div className="flex flex-col items-center gap-1">
            <span>📊</span>
            <span className="text-xs">Results</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
