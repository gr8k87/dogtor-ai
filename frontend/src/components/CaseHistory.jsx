
import React, { useState, useEffect } from 'react'
import { getCasesOffline, exportCaseAsJSON } from '../utils/offline'

function CaseHistory({ isOnline, activeTab, setActiveTab }) {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = () => {
    const offlineCases = getCasesOffline()
    setCases(offlineCases.reverse()) // Show newest first
  }

  const handleCaseSelect = (caseData) => {
    setSelectedCase(caseData)
  }

  const handleBackToList = () => {
    setSelectedCase(null)
  }

  const handleExport = (caseData) => {
    exportCaseAsJSON(caseData)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  if (selectedCase) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-20">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToList}
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Case Details</h1>
                </div>
              </div>
              
              <button
                onClick={() => handleExport(selectedCase)}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </header>

        <div className="px-4 py-6">
          <div className="max-w-md mx-auto space-y-6">
            {/* Case Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Analysis Summary</h2>
                <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getUrgencyColor(selectedCase.triage_summary?.urgency_level)}`}>
                  {selectedCase.triage_summary?.urgency_level || 'Unknown'} Priority
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="text-gray-900">{formatDate(selectedCase.timestamp)}</p>
                </div>
                
                {selectedCase.triage_summary?.triage_summary && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">AI Assessment</p>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-800 leading-relaxed">
                        {selectedCase.triage_summary.triage_summary}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Image */}
            {selectedCase.image_url && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Photo</h3>
                <img 
                  src={selectedCase.image_url} 
                  alt="Case analysis" 
                  className="w-full rounded-xl shadow-md"
                />
              </div>
            )}

            {/* Observations */}
            {selectedCase.observations && selectedCase.observations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Observations</h3>
                <div className="space-y-2">
                  {selectedCase.observations.map((obs, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700 text-sm">{obs}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Answers */}
            {selectedCase.user_answers && Object.keys(selectedCase.user_answers).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Answers</h3>
                <div className="space-y-3">
                  {Object.entries(selectedCase.user_answers).map(([question, answer], index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                      <p className="text-sm text-gray-600 mb-1">{question}</p>
                      <p className="text-gray-900">{answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2h8.59a2 2 0 0 1 1.42.57l4.44 4.44a2 2 0 0 1 .57 1.42v10.3a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 19.5z"></path>
                  <path d="M7 17L7 12"></path>
                  <path d="M7 12L11 12"></path>
                  <path d="M7 8L7 10"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Case History</h1>
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

      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {cases.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2h8.59a2 2 0 0 1 1.42.57l4.44 4.44a2 2 0 0 1 .57 1.42v10.3a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 19.5z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Yet</h3>
              <p className="text-gray-600 text-sm mb-6">
                Your completed analyses will appear here
              </p>
              <button
                onClick={() => setActiveTab('diagnose')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                Start First Analysis
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((caseData, index) => (
                <div
                  key={index}
                  onClick={() => handleCaseSelect(caseData)}
                  className="bg-white rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-blue-200"
                >
                  <div className="flex items-start space-x-4">
                    {caseData.image_url && (
                      <img 
                        src={caseData.image_url} 
                        alt="Case thumbnail" 
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">
                          {formatDate(caseData.timestamp)}
                        </p>
                        <div className={`px-2 py-1 rounded-full text-white text-xs font-medium ${getUrgencyColor(caseData.triage_summary?.urgency_level)}`}>
                          {caseData.triage_summary?.urgency_level || 'Unknown'}
                        </div>
                      </div>
                      
                      <p className="text-gray-900 text-sm leading-relaxed line-clamp-2">
                        {caseData.triage_summary?.triage_summary || 'Analysis completed'}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default CaseHistory
