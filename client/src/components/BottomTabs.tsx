
import React from "react";

interface BottomTabsProps {
  navigate: any;
  activeTab: 'diagnose' | 'history' | 'results';
}

export default function BottomTabs({ navigate, activeTab }: BottomTabsProps) {
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
          className={`flex-1 py-3 px-4 text-center text-sm font-medium ${
            activeTab === "results" 
              ? "text-blue-600 bg-blue-50" 
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          disabled={activeTab !== "results"}
        >
          <div className="flex flex-col items-center gap-1">
            <span>📊</span>
            <span>Results</span>
          </div>
        </button>
      </div>
    </div>
  );
}
