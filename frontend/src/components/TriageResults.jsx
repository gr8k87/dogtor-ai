
import React from 'react'
import { saveCaseOffline } from '../utils/offline'

function TriageResults({ triageResults, caseData, observations, onStartNew }) {
  if (!triageResults) return null

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-green-500'
      case 'Moderate': return 'bg-yellow-500'
      case 'High': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getUrgencyBg = (level) => {
    switch (level) {
      case 'Low': return 'bg-green-50 border-green-200'
      case 'Moderate': return 'bg-yellow-50 border-yellow-200'
      case 'High': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const handleSaveToHistory = () => {
    alert('Case saved to history!')
  }

  const handleShareWithVet = () => {
    const caseExport = {
      case_id: caseData?.case_id,
      timestamp: new Date().toISOString(),
      image_url: caseData?.image_url,
      observations,
      triage_results: triageResults
    }
    
    const jsonString = JSON.stringify(caseExport, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `dogtor-case-${caseData?.case_id || 'export'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header with Priority */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-white font-medium ${getUrgencyColor(triageResults.urgency_level)} shadow-lg`}>
            <i data-feather="shield" className="w-4 h-4 mr-2"></i>
            {triageResults.urgency_level} Priority
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Analysis Complete</h1>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <i data-feather="file-text" className="w-5 h-5 text-blue-600"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
              <p className="text-sm text-gray-600">AI analysis results</p>
            </div>
          </div>
          
          <div className={`border rounded-xl p-4 ${getUrgencyBg(triageResults.urgency_level)}`}>
            <p className="text-gray-800 leading-relaxed">
              {triageResults.triage_summary}
            </p>
          </div>

          {triageResults.meta?.error && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3">
              <div className="flex items-center">
                <i data-feather="alert-circle" className="w-4 h-4 text-orange-600 mr-2"></i>
                <span className="text-sm text-orange-800">
                  Conservative assessment due to analysis limitations
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Possible Causes */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <i data-feather="search" className="w-5 h-5 text-purple-600"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Possible Causes</h3>
          </div>
          
          <div className="space-y-3">
            {triageResults.possible_causes?.map((cause, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <span className="text-gray-700 text-sm leading-relaxed">{cause}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <i data-feather="check-circle" className="w-5 h-5 text-green-600"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
          </div>
          
          <div className="space-y-3">
            {triageResults.recommended_actions?.map((action, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i data-feather="check" className="w-3 h-3 text-green-600"></i>
                </div>
                <span className="text-gray-700 text-sm leading-relaxed">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <i data-feather="alert-triangle" className="w-4 h-4 text-amber-600"></i>
            </div>
            <div>
              <h4 className="font-medium text-amber-900 mb-1">Important Notice</h4>
              <p className="text-sm text-amber-800 leading-relaxed">
                This AI analysis is for informational purposes only. Always consult a qualified veterinarian for professional advice.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSaveToHistory}
              className="px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg"
            >
              <i data-feather="bookmark" className="w-4 h-4 inline mr-2"></i>
              Save
            </button>
            
            <button
              onClick={handleShareWithVet}
              className="px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors shadow-lg"
            >
              <i data-feather="share" className="w-4 h-4 inline mr-2"></i>
              Export
            </button>
          </div>

          <button
            onClick={onStartNew}
            className="w-full px-6 py-4 bg-white border-2 border-blue-500 text-blue-500 rounded-xl font-medium hover:bg-blue-50 transition-colors"
          >
            <i data-feather="plus" className="w-4 h-4 inline mr-2"></i>
            New Analysis
          </button>
        </div>
      </div>
    </div>
  )
}

export default TriageResults
