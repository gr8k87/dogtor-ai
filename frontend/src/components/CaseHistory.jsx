import React, { useState, useEffect } from 'react'
import { getCases, getCase } from '../services/api'
import { getCasesOffline } from '../utils/offline'

function CaseHistory({ isOnline }) {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCases()
  }, [isOnline])

  const loadCases = async () => {
    setLoading(true)
    setError(null)

    try {
      if (isOnline) {
        // Load from API
        const apiCases = await getCases()
        setCases(apiCases)
      } else {
        // Load from offline storage
        const offlineCases = getCasesOffline()
        setCases(offlineCases)
      }
    } catch (err) {
      console.error('Failed to load cases:', err)
      // Fallback to offline data
      const offlineCases = getCasesOffline()
      setCases(offlineCases)

      if (!isOnline) {
        setError('Viewing offline data only. Connect to internet for latest cases.')
      } else {
        setError('Failed to load cases from server. Showing offline data.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCaseClick = async (caseId) => {
    try {
      let fullCase

      if (isOnline) {
        fullCase = await getCase(caseId)
      } else {
        // Get from offline storage
        const offlineCases = getCasesOffline()
        fullCase = offlineCases.find(c => c.case_id === caseId)
      }

      setSelectedCase(fullCase)
    } catch (err) {
      console.error('Failed to load case details:', err)
      alert('Failed to load case details')
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

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'closed': return 'bg-green-100 text-green-800'
      case 'open': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (selectedCase) {
    return <CaseDetail case={selectedCase} onBack={() => setSelectedCase(null)} onExport={handleExportCase} />
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Case History</h2>
          {!isOnline && (
            <div className="flex items-center text-orange-600 text-sm">
              <i data-feather="wifi-off" className="w-4 h-4 mr-1"></i>
              Offline Mode
            </div>
          )}
        </div>

        {error && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <i data-feather="alert-circle" className="w-5 h-5 text-orange-600 mr-2"></i>
              <span className="text-orange-800">{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading case history...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <i data-feather="folder" className="w-8 h-8 text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Cases Yet</h3>
            <p className="text-gray-600">
              Start by uploading a photo in the Diagnose tab to create your first case.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map(caseItem => (
              <div
                key={caseItem.case_id}
                onClick={() => handleCaseClick(caseItem.case_id)}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={caseItem.image_url}
                    alt="Case"
                    className="w-16 h-16 object-cover rounded-lg border"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNEwyNCAyMEwyOCAyNEw0MCAyMEw0NCAyNFYzMkM0NCAzNC4yMDkxIDQyLjIwOTEgMzYgNDAgMzZIMjRDMjEuNzkwOSAzNiAyMCAzNC4yMDkxIDIwIDMyVjI0WiIgZmlsbD0iI0Q1RDVENSIvPgo8Y2lyY2xlIGN4PSIzMiIgY3k9IjI4IiByPSIyIiBmaWxsPSIjOEQ4RDhEIi8+Cjwvc3ZnPgo='
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        Case {caseItem.case_id?.slice(0, 8)}...
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status || 'open'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 truncate">
                      {caseItem.summary_line || 'Analysis pending...'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(caseItem.timestamp)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <i data-feather="chevron-right" className="w-5 h-5 text-gray-400"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CaseDetail({ case: caseData, onBack, onExport }) {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <i data-feather="arrow-left" className="w-5 h-5"></i>
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              Case Details
            </h2>
          </div>
          <button
            onClick={() => onExport(caseData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i data-feather="download" className="w-4 h-4 inline mr-2"></i>
            Export JSON
          </button>
        </div>

        <div className="space-y-6">
          {/* Case Info */}
          <div className="flex items-start space-x-6">
            <img
              src={caseData.image_url}
              alt="Case"
              className="w-32 h-32 object-cover rounded-lg border"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0OEw0OCA0MEw1NiA0OEw4MCA0MEw4OCA0OFY2NEM4OCA2OC40MTgzIDg0LjQxODMgNzIgODAgNzJINDhDNDMuNTgxNyA3MiA0MCA2OC40MTgzIDQwIDY0VjQ4WiIgZmlsbD0iI0Q1RDVENSIvPgo8Y2lyY2xlIGN4PSI2NCIgY3k9IjU2IiByPSI0IiBmaWxsPSIjOEQ4RDhEIi8+Cjwvc3ZnPgo='
              }}
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Case ID: {caseData.case_id}
              </h3>
              <p className="text-gray-600 mb-1">
                <strong>Created:</strong> {formatDate(caseData.timestamp)}
              </p>
              <p className="text-gray-600">
                <strong>Status:</strong> {caseData.status || 'open'}
              </p>
            </div>
          </div>

          {/* Observations */}
          {caseData.observations && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-3">AI Observations</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Consistency:</strong> {caseData.observations.observations?.consistency || 'unknown'}</p>
                  <p><strong>Color:</strong> {caseData.observations.observations?.color || 'unknown'}</p>
                </div>
                <div>
                  <p><strong>Blood:</strong> {caseData.observations.observations?.blood || 'none'}</p>
                  <p><strong>Mucus:</strong> {caseData.observations.observations?.mucus ? 'Present' : 'Not detected'}</p>
                </div>
                {caseData.observations.observations?.notes && (
                  <div className="md:col-span-2">
                    <p><strong>Notes:</strong> {caseData.observations.observations.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Answers */}
          {caseData.user_answers && Object.keys(caseData.user_answers).length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Your Answers</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(caseData.user_answers).map(([key, value]) => (
                  <p key={key}>
                    <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong> {value}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Triage Results */}
          {caseData.triage_summary && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Triage Results</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(caseData.triage_summary.urgency_level)}`}>
                  {caseData.triage_summary.urgency_level} Priority
                </span>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-800">
                  {caseData.triage_summary.triage_summary}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Possible Causes</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {caseData.triage_summary.possible_causes?.map((cause, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommended Actions</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {caseData.triage_summary.recommended_actions?.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <i data-feather="check" className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5"></i>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CaseHistory