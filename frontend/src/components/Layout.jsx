
import React, { useEffect } from 'react'

function Layout({ activeTab, setActiveTab, isOnline, children }) {
  const tabs = [
    { id: 'diagnose', label: 'Diagnose', icon: 'shield-check' },
    { id: 'history', label: 'History', icon: 'file-text' },
    { id: 'connect', label: 'Connect', icon: 'phone' }
  ]

  // Add feather icons if not already loaded
  useEffect(() => {
    if (window.feather) {
      window.feather.replace()
    }
  }, [activeTab])

  const getIconSvg = (iconName) => {
    switch (iconName) {
      case 'shield-check':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v7c0 6 8 10 8 10z"></path>
            <path d="M12 7v5"></path>
            <path d="M12 16v-3"></path>
          </svg>
        )
      case 'file-text':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2h8.59a2 2 0 0 1 1.42.57l4.44 4.44a2 2 0 0 1 .57 1.42v10.3a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 19.5z"></path>
            <path d="M7 17L7 12"></path>
            <path d="M7 12L11 12"></path>
            <path d="M7 8L7 10"></path>
          </svg>
        )
      case 'phone':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dogtor AI</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isOnline && (
                <div className="flex items-center text-orange-600 text-xs">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M16.73 18.34a5 5 0 0 0-7.46-0.01"></path>
                    <path d="M13.84 13.84a3 3 0 0 0-4.08 0"></path>
                    <line x1="10" y1="10" x2="10.01" y2="10"></line>
                  </svg>
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
      <main className="flex-1 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex justify-around items-center py-3 z-30 shadow-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center px-4 py-2 min-w-0 flex-1 transition-all duration-200"
          >
            <div className={`w-6 h-6 flex items-center justify-center mb-1 transition-all duration-200 ${activeTab === tab.id ? 'text-blue-600 scale-110' : 'text-gray-500'}`}>
              {getIconSvg(tab.icon)}
            </div>
            <span className={`text-xs font-medium transition-all duration-200 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Layout
