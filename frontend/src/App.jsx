import React, { useState, useEffect } from 'react'
import Layout from './components/Layout'
import DiagnoseFlow from './components/DiagnoseFlow'
import CaseHistory from './components/CaseHistory'
import { initOfflineStorage } from './utils/offline'

function App() {
  const [activeTab, setActiveTab] = useState('diagnose')
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'diagnose':
        return <DiagnoseFlow onBack={() => setActiveTab('history')} />
      case 'history':
        return <CaseHistory onBack={() => setActiveTab('diagnose')} />
      case 'connect':
        return <div className="p-4">Connect feature coming soon.</div>
      default:
        return null
    }
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveTab()}
    </Layout>
  )
}

export default App