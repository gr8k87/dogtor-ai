import React, { useState, useEffect } from 'react'
import Layout from './components/Layout'
import DiagnoseFlow from './components/DiagnoseFlow'
import CaseHistory from './components/CaseHistory'
import Home from './components/Home'
import { initOfflineStorage } from './utils/offline'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [activeTab, setActiveTab] = useState(null)
  const [isOfflineReady, setIsOfflineReady] = useState(false)

  useEffect(() => {
    // Initialize offline storage
    const offlineInitialized = initOfflineStorage()
    setIsOfflineReady(offlineInitialized)

    // Service worker registration handled in index.html
  }, [])

  const handleStartDiagnosis = () => {
    setCurrentView('diagnose')
    setActiveTab('diagnose')
  }

  const handleViewHistory = () => {
    setCurrentView('history')
    setActiveTab('history')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setActiveTab(null)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    switch (tab) {
      case 'diagnose':
        setCurrentView('diagnose')
        break
      case 'history':
        setCurrentView('history')
        break
      default:
        setCurrentView('home')
    }
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'diagnose':
        return <DiagnoseFlow onBack={handleBackToHome} />
      case 'history':
        return <CaseHistory onBack={handleBackToHome} />
      default:
        return <Home onStartDiagnosis={handleStartDiagnosis} onViewHistory={handleViewHistory} />
    }
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
      {renderCurrentView()}
    </Layout>
  )
}

export default App
