import { FileText, Clock, Phone } from "lucide-react";

interface BottomNavigationProps {
  activeTab: "Diagnose" | "History" | "Connect";
  onTabChange: (tab: "Diagnose" | "History" | "Connect") => void;
}

const tabConfig = {
  Diagnose: { icon: FileText, label: "Diagnose" },
  History: { icon: Clock, label: "History" },
  Connect: { icon: Phone, label: "Connect" },
};

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-3">
        {(Object.keys(tabConfig) as Array<keyof typeof tabConfig>).map((tab) => {
          const { icon: Icon, label } = tabConfig[tab];
          const isActive = activeTab === tab;
          
          return (
            <button
              key={tab}
              data-testid={`tab-${tab.toLowerCase()}`}
              onClick={() => onTabChange(tab)}
              className={`py-3 px-4 text-center font-medium transition-colors ${
                isActive
                  ? "text-primary-600 bg-primary-50 border-t-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
