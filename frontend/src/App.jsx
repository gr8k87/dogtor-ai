import React, { useState, useEffect } from 'react'
import Layout from './components/Layout'
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
        return <DiagnoseFlow isOnline={isOnline} />
      case 'history':
        return <CaseHistory isOnline={isOnline} />
      case 'connect':
        return <ConnectToVet />
      default:
        return <DiagnoseFlow isOnline={isOnline} />
    }
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} isOnline={isOnline}>
      {renderContent()}
    </Layout>
  )
}

// Connect to Vet tab (MVP stub)
function ConnectToVet() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">👩‍⚕️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect with a Veterinarian</h2>
          <p className="text-gray-600 mb-6">
            Export your case data to share with your veterinarian or connect with partner clinics.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Coming Soon:</strong> Direct integration with veterinary partners for seamless case sharing.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            For now, use the Export JSON feature in case history to share your analysis with your vet.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
