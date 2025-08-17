
import React, { useState, useEffect } from 'react'
import { getCasesOffline, clearOfflineStorage } from '../utils/offline'

function CaseHistory() {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)

  useEffect(() => {
    const loadCases = () => {
      const offlineCases = getCasesOffline()
      setCases(offlineCases)
    }
    loadCases()
  }, [])

  const handleClearHistory = () => {
    if (window.confirm('Clear all case history? This cannot be undone.')) {
      clearOfflineStorage()
      setCases([])
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-50'
      case 'Moderate': return 'text-yellow-600 bg-yellow-50'
      case 'High': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
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
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12,19 5,12 12,5"></polyline>
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Case Details</h1>
            <div className="w-10 h-10"></div>
          </div>

          {/* Case Image */}
          {selectedCase.image_url && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <img
                src={selectedCase.image_url}
                alt="Case"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Triage Results */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Triage Results</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(selectedCase.triage_summary?.urgency_level)}`}>
                {selectedCase.triage_summary?.urgency_level} Priority
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {selectedCase.triage_summary?.triage_summary}
            </p>
          </div>

          {/* Observations */}
          {selectedCase.observations && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Observations</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="font-medium text-blue-900">Consistency</p>
                  <p className="text-blue-800">{selectedCase.observations.consistency}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="font-medium text-blue-900">Color</p>
                  <p className="text-blue-800">{selectedCase.observations.color}</p>
                </div>
              </div>
            </div>
          )}

          {/* Case Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Case ID:</span>
                <span className="text-gray-900 font-medium">{selectedCase.case_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="text-gray-900 font-medium">{formatDate(selectedCase.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium capitalize">{selectedCase.status}</span>
              </div>
            </div>
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
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2h8.59a2 2 0 0 1 1.42.57l4.44 4.44a2 2 0 0 1 .57 1.42v10.3a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 19.5z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Case History</h1>
          <p className="text-gray-600">Review your past analyses</p>
        </div>

        {cases.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2h8.59a2 2 0 0 1 1.42.57l4.44 4.44a2 2 0 0 1 .57 1.42v10.3a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 19.5z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Yet</h3>
            <p className="text-gray-600 mb-6">
              Complete your first analysis to see cases here
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cases.map((caseItem) => (
                <div
                  key={caseItem.case_id}
                  onClick={() => setSelectedCase(caseItem)}
                  className="bg-white rounded-2xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    {caseItem.image_url && (
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={caseItem.image_url}
                          alt="Case"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          Case {caseItem.case_id.slice(-6)}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(caseItem.triage_summary?.urgency_level)}`}>
                          {caseItem.triage_summary?.urgency_level || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 truncate">
                        {caseItem.triage_summary?.triage_summary || 'Analysis completed'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(caseItem.timestamp)}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleClearHistory}
              className="w-full px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Clear All History
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default CaseHistory
