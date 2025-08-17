import React from 'react'

function Layout({ activeTab, setActiveTab, isOnline, children }) {
  const tabs = [
    { id: 'diagnose', label: 'Diagnose', icon: 'camera' },
    { id: 'history', label: 'History', icon: 'folder' },
    { id: 'connect', label: 'Connect', icon: 'users' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <i data-feather="heart" className="w-6 h-6 text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dogtor AI</h1>
                <p className="text-sm text-gray-600">Not a vet, just your first step.</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isOnline && (
                <div className="flex items-center text-orange-600 text-sm">
                  <i data-feather="wifi-off" className="w-4 h-4 mr-1"></i>
                  Offline
                </div>
              )}
              
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                <i data-feather={tab.icon} className="w-4 h-4"></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Medical Disclaimer:</strong> Dogtor AI provides informational triage only. 
              Always consult with a qualified veterinarian for definitive diagnosis and treatment.
            </p>
            <p>© 2024 Dogtor AI. Not a replacement for professional veterinary care.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
