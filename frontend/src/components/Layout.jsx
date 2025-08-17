import React from 'react'

function Layout({ children, activeTab, setActiveTab }) {
  const tabs = [
    {
      id: 'diagnose',
      name: 'Diagnose',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-6 0v4"></path>
          <rect x="2" y="9" width="20" height="12" rx="2" ry="2"></rect>
          <circle cx="12" cy="15" r="1"></circle>
        </svg>
      )
    },
    {
      id: 'history',
      name: 'History',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v5h5"></path>
          <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"></path>
          <path d="M12 7v5l4 2"></path>
        </svg>
      )
    },
    {
      id: 'connect',
      name: 'Connect',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="pb-20">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-lg transition-colors
                  ${activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className="mb-1">
                  {tab.icon}
                </div>
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout