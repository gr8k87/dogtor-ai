import React, { useState, useEffect } from 'react'
import Layout from './components/Layout'
import DiagnoseFlow from './components/DiagnoseFlow'
import CaseHistory from './components/CaseHistory'
import { initOfflineStorage } from './utils/offline'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [isOfflineReady, setIsOfflineReady] = useState(false)

  useEffect(() => {
    // Initialize offline storage
    const offlineInitialized = initOfflineStorage()
    setIsOfflineReady(offlineInitialized)

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration)
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError)
        })
    }
  }, [])

  const handleStartDiagnosis = () => {
    setCurrentView('diagnose')
  }

  const handleViewHistory = () => {
    setCurrentView('history')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'diagnose':
        return <DiagnoseFlow onBack={handleBackToHome} />
      case 'history':
        return <CaseHistory onBack={handleBackToHome} />
      default:
        return (
          <Layout 
            onStartDiagnosis={handleStartDiagnosis}
            onViewHistory={handleViewHistory}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {renderCurrentView()}
    </div>
  )
}

export default App