
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'diagnose':
        return (
          <DiagnoseFlow 
            isOnline={isOnline} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
          />
        )
      case 'history':
        return <CaseHistory />
      case 'connect':
        return (
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8 pb-24">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect with Vets</h1>
                <p className="text-gray-600">Get professional help</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Emergency Vet</p>
                      <p className="text-sm text-gray-600">Call your local emergency clinic</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Your Vet</p>
                      <p className="text-sm text-gray-600">Contact your regular veterinarian</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-900 mb-1">Important Notice</h4>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        Dogtor AI provides informational triage only. Always consult a qualified veterinarian for professional diagnosis and treatment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Network status indicator */}
      {!isOnline && (
        <div className="bg-red-500 text-white text-center py-2 text-sm">
          You are offline. Some features may be limited.
        </div>
      )}
      {renderActiveTab()}
    </Layout>
  )
}

export default App
