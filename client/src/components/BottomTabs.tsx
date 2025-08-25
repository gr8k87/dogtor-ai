import React from "react";
import { AppIcons } from "./icons";
import { cn } from "../lib/utils";
interface BottomTabsProps {
  navigate: any;
  activeTab: "diagnose" | "history" | "results" | "connect";
}

export default function BottomTabs({ navigate, activeTab }: BottomTabsProps) {
  const tabs = [
    {
      id: "diagnose",
      label: "Diagnose",
      path: "/",
      icon: AppIcons.diagnose,
    },
    {
      id: "history",
      label: "History",
      path: "/history",
      icon: AppIcons.history,
    },
    {
      id: "connect",
      label: "Connect",
      path: "/connect",
      icon: AppIcons.connect,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-around items-center px-4 py-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              data-testid={`tab-${tab.id}`}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[4rem]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent hover:scale-105",
              )}
            >
              <Icon size={20} className="transition-transform duration-200" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Safe area padding for mobile devices */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
}
