import { useState } from "react";
import BottomNavigation from "@/components/bottom-navigation";
import DiagnoseTab from "@/components/diagnose-tab";
import HistoryTab from "@/components/history-tab";
import ConnectTab from "@/components/connect-tab";

const tabs = ["Diagnose", "History", "Connect"] as const;
type Tab = typeof tabs[number];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("Diagnose");

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-lg">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 shadow-md">
        <div className="text-center">
          <h1 className="text-xl font-bold">🐕 Dogtor AI</h1>
          <p className="text-primary-100 text-sm font-light">Not a vet, just your first step</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "Diagnose" && <DiagnoseTab />}
        {activeTab === "History" && <HistoryTab />}
        {activeTab === "Connect" && <ConnectTab />}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
