
import React, { useState, useEffect } from 'react'
import { getCases } from '../services/api'
import { getCasesOffline, clearOfflineStorage } from '../utils/offline'

function CaseHistory({ onBack }) {
  const [cases, setCases] = useState([])
  const [offlineCases, setOfflineCases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Load online cases
      const onlineCases = await getCases()
      setCases(onlineCases)
      
      // Load offline cases
      const offline = getCasesOffline()
      setOfflineCases(offline)
    } catch (err) {
      console.error('Failed to load cases:', err)
      setError(err.message || 'Failed to load case history')
      
      // Fallback to offline only
      const offline = getCasesOffline()
      setOfflineCases(offline)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearOffline = () => {
    if (window.confirm('Clear all offline cases? This cannot be undone.')) {
      clearOfflineStorage()
      setOfflineCases([])
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12,19 5,12 12,5"></polyline>
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Case History</h1>
          <div className="w-10 h-10"></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Online Cases */}
        {cases.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Cases</h2>
            <div className="space-y-3">
              {cases.map((case_item) => (
                <div key={case_item.case_id} className="bg-white rounded-xl shadow-md p-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={case_item.image_url} 
                      alt="Case" 
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {case_item.summary_line}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(case_item.timestamp)}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                        case_item.status === 'closed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {case_item.status === 'closed' ? 'Complete' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offline Cases */}
        {offlineCases.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Offline Cases</h2>
              <button
                onClick={handleClearOffline}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-3">
              {offlineCases.map((case_item) => (
                <div key={case_item.id} className="bg-white rounded-xl shadow-md p-4 border-l-4 border-orange-400">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21,15 16,10 5,21"></polyline>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        Offline Case - Sync when online
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(case_item.timestamp)}
                      </p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full mt-2 bg-orange-100 text-orange-800">
                        Offline
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {cases.length === 0 && offlineCases.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
            </div>
            <p className="text-gray-600 text-lg font-medium">No cases yet</p>
            <p className="text-gray-500 text-sm mt-2">Start your first diagnosis to see history here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CaseHistory
