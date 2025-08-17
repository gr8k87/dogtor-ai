
import React, { useState, useEffect } from 'react'
import { getCasesOffline, exportCasesOffline, clearOfflineData } from '../utils/offline'

function CaseHistory({ isOnline }) {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    try {
      const offlineCases = getCasesOffline()
      setCases(offlineCases.reverse()) // Most recent first
    } catch (error) {
      console.error('Failed to load cases:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportAll = () => {
    exportCasesOffline()
  }

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all case history? This cannot be undone.')) {
      clearOfflineData()
      setCases([])
    }
  }

  const handleExportCase = (caseData) => {
    const jsonString = JSON.stringify(caseData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `dogtor-case-${caseData.case_id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Moderate': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (selectedCase) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6 pb-24">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedCase(null)}
              className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <i data-feather="arrow-left" className="w-5 h-5 text-gray-600"></i>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Case Details</h1>
            <button
              onClick={() => handleExportCase(selectedCase)}
              className="w-10 h-10 bg-blue-500 rounded-xl shadow-md flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <i data-feather="download" className="w-5 h-5 text-white"></i>
            </button>
          </div>

          <div className="space-y-6">
            
            {/* Case Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Case #{selectedCase.case_id?.slice(-8)}</h3>
                  <p className="text-sm text-gray-600">{formatDate(selectedCase.timestamp)}</p>
                </div>
                {selectedCase.triage_summary?.urgency_level && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(selectedCase.triage_summary.urgency_level)}`}>
                    {selectedCase.triage_summary.urgency_level}
                  </span>
                )}
              </div>

              {selectedCase.image_url && (
                <div className="mb-4">
                  <img
                    src={selectedCase.image_url}
                    alt="Case"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
              )}
            </div>

            {/* AI Observations */}
            {selectedCase.observations && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <i data-feather="eye" className="w-5 h-5 mr-2 text-blue-600"></i>
                  AI Observations
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="font-medium text-blue-900">Consistency</p>
                    <p className="text-blue-800">{selectedCase.observations.observations?.consistency || 'unknown'}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="font-medium text-blue-900">Color</p>
                    <p className="text-blue-800">{selectedCase.observations.observations?.color || 'unknown'}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="font-medium text-blue-900">Blood</p>
                    <p className="text-blue-800">{selectedCase.observations.observations?.blood || 'none'}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="font-medium text-blue-900">Mucus</p>
                    <p className="text-blue-800">{selectedCase.observations.observations?.mucus ? 'Present' : 'Not detected'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Triage Results */}
            {selectedCase.triage_summary && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <i data-feather="file-text" className="w-5 h-5 mr-2 text-green-600"></i>
                  Analysis Summary
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-gray-800 leading-relaxed">
                    {selectedCase.triage_summary.triage_summary}
                  </p>
                </div>

                {selectedCase.triage_summary.possible_causes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Possible Causes</h4>
                    <div className="space-y-2">
                      {selectedCase.triage_summary.possible_causes.map((cause, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                          </div>
                          <span className="text-sm text-gray-700">{cause}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCase.triage_summary.recommended_actions && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommended Actions</h4>
                    <div className="space-y-2">
                      {selectedCase.triage_summary.recommended_actions.map((action, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <i data-feather="check" className="w-2.5 h-2.5 text-green-600"></i>
                          </div>
                          <span className="text-sm text-gray-700">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6 pb-24">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <i data-feather="book-open" className="w-8 h-8 text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Case History</h1>
          <p className="text-gray-600">Your past health analyses</p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading history...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <i data-feather="inbox" className="w-8 h-8 text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Yet</h3>
            <p className="text-gray-600 mb-4">Your analysis history will appear here</p>
            <p className="text-sm text-gray-500">Complete your first health check to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleExportAll}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg"
              >
                <i data-feather="download" className="w-4 h-4 inline mr-2"></i>
                Export All
              </button>
              <button
                onClick={handleClearHistory}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg"
              >
                <i data-feather="trash-2" className="w-4 h-4 inline mr-2"></i>
                Clear All
              </button>
            </div>

            {/* Cases List */}
            <div className="space-y-4">
              {cases.map((caseData, index) => (
                <div
                  key={caseData.case_id || index}
                  onClick={() => setSelectedCase(caseData)}
                  className="bg-white rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    
                    {/* Case Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {caseData.image_url ? (
                        <img
                          src={caseData.image_url}
                          alt="Case"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i data-feather="image" className="w-6 h-6 text-gray-400"></i>
                        </div>
                      )}
                    </div>

                    {/* Case Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          Case #{caseData.case_id?.slice(-8) || `Case ${index + 1}`}
                        </h3>
                        {caseData.triage_summary?.urgency_level && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(caseData.triage_summary.urgency_level)}`}>
                            {caseData.triage_summary.urgency_level}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatDate(caseData.timestamp)}
                      </p>
                      {caseData.triage_summary?.triage_summary && (
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {caseData.triage_summary.triage_summary}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <i data-feather="chevron-right" className="w-5 h-5 text-gray-400"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CaseHistory
