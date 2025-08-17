
import React, { useState, useEffect } from 'react'
import DiagnoseFlow from './components/DiagnoseFlow'
import CaseHistory from './components/CaseHistory'
import { initOfflineStorage } from './utils/offline'

function App() {
  const [activeTab, setActiveTab] = useState('diagnose')
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    // Initialize offline storage
    initOfflineStorage()
    
    // Online/offline listeners
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'diagnose':
        return <DiagnoseFlow isOnline={isOnline} activeTab={activeTab} setActiveTab={setActiveTab} />
      case 'history':
        return <CaseHistory isOnline={isOnline} activeTab={activeTab} setActiveTab={setActiveTab} />
      case 'connect':
        return <ConnectToVet activeTab={activeTab} setActiveTab={setActiveTab} />
      default:
        return <DiagnoseFlow isOnline={isOnline} activeTab={activeTab} setActiveTab={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderContent()}
    </div>
  )
}

// Connect to Vet tab (MVP stub)
function ConnectToVet({ activeTab, setActiveTab }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8 pb-24">
      {/* Header */}
      <header className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect with a Veterinarian</h1>
        <p className="text-gray-600 text-sm">
          Export your case data to share with your veterinarian or connect with partner clinics.
        </p>
      </header>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Coming Soon</h4>
                <p className="text-sm text-yellow-800 leading-relaxed">
                  Direct integration with veterinary partners for seamless case sharing.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              For now, use the Export JSON feature in case history to share your analysis with your vet.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex justify-around items-center py-3 z-30 shadow-lg">
        <button
          onClick={() => setActiveTab('diagnose')}
          className="flex flex-col items-center justify-center px-4 py-2 min-w-0 flex-1 transition-all duration-200"
        >
          <div className={`w-6 h-6 flex items-center justify-center mb-1 transition-all duration-200 ${activeTab === 'diagnose' ? 'text-blue-600 scale-110' : 'text-gray-500'}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v7c0 6 8 10 8 10z"></path>
              <path d="M12 7v5"></path>
              <path d="M12 16v-3"></path>
            </svg>
          </div>
          <span className={`text-xs font-medium transition-all duration-200 ${activeTab === 'diagnose' ? 'text-blue-600' : 'text-gray-500'}`}>
            Diagnose
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className="flex flex-col items-center justify-center px-4 py-2 min-w-0 flex-1 transition-all duration-200"
        >
          <div className={`w-6 h-6 flex items-center justify-center mb-1 transition-all duration-200 ${activeTab === 'history' ? 'text-blue-600 scale-110' : 'text-gray-500'}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2h8.59a2 2 0 0 1 1.42.57l4.44 4.44a2 2 0 0 1 .57 1.42v10.3a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 19.5z"></path>
              <path d="M7 17L7 12"></path>
              <path d="M7 12L11 12"></path>
              <path d="M7 8L7 10"></path>
            </svg>
          </div>
          <span className={`text-xs font-medium transition-all duration-200 ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-500'}`}>
            History
          </span>
        </button>
        <button
          onClick={() => setActiveTab('connect')}
          className="flex flex-col items-center justify-center px-4 py-2 min-w-0 flex-1 transition-all duration-200"
        >
          <div className={`w-6 h-6 flex items-center justify-center mb-1 transition-all duration-200 ${activeTab === 'connect' ? 'text-blue-600 scale-110' : 'text-gray-500'}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <span className={`text-xs font-medium transition-all duration-200 ${activeTab === 'connect' ? 'text-blue-600' : 'text-gray-500'}`}>
            Connect
          </span>
        </button>
      </div>
    </div>
  )
}

export default App
