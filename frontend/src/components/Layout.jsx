import React, { useEffect } from 'react'

function Layout({ activeTab, setActiveTab, isOnline, children }) {
  useEffect(() => {
    // Initialize feather icons when component mounts
    if (window.feather) {
      window.feather.replace()
    }
  }, [activeTab])
  const tabs = [
    { id: 'diagnose', label: 'Diagnose', icon: 'shield-check' },
    { id: 'history', label: 'History', icon: 'file-text' },
    { id: 'connect', label: 'Connect', icon: 'phone' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header - Simplified */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i data-feather="heart" className="w-5 h-5 text-white"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dogtor AI</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isOnline && (
                <div className="flex items-center text-orange-600 text-xs">
                  <i data-feather="wifi-off" className="w-3 h-3 mr-1"></i>
                  <span className="hidden sm:inline">Offline</span>
                </div>
              )}
              
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {children}
      </main>

      {/* Bottom Navigation - Mobile App Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around items-center py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex flex-col items-center justify-center px-3 py-2 min-w-0 flex-1 transition-colors
                ${activeTab === tab.id 
                  ? 'text-blue-600' 
                  : 'text-gray-600'
                }
              `}
            >
              <div className={`
                w-6 h-6 flex items-center justify-center mb-1
                ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}
              `}>
                <i data-feather={tab.icon} className="w-5 h-5"></i>
              </div>
              <span className={`
                text-xs font-medium
                ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}
              `}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Medical Disclaimer - Mobile Optimized */}
      <div className="fixed bottom-16 left-0 right-0 bg-yellow-50 border-t border-yellow-200 px-4 py-2 text-xs text-yellow-800 text-center hidden" id="disclaimer">
        ⚠️ Not a vet—informational triage only. Always consult a veterinarian.
      </div>
    </div>
  )
}

export default Layout
