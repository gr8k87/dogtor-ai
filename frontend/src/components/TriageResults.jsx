import React from 'react'
import { saveCaseOffline } from '../utils/offline'

function TriageResults({ triageResults, caseData, observations, onStartNew }) {
  if (!triageResults) return null

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyIcon = (level) => {
    switch (level) {
      case 'Low': return 'check-circle'
      case 'Moderate': return 'alert-circle'
      case 'High': return 'alert-triangle'
      default: return 'help-circle'
    }
  }

  const handleSaveToHistory = () => {
    // Case is already saved in DiagnoseFlow, just show confirmation
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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Triage Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Triage Results</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(triageResults.urgency_level)}`}>
            <i data-feather={getUrgencyIcon(triageResults.urgency_level)} className="w-4 h-4 inline mr-1"></i>
            {triageResults.urgency_level} Priority
          </div>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-blue-800 leading-relaxed">
            {triageResults.triage_summary}
          </p>
        </div>

        {/* Error fallback indicator */}
        {triageResults.meta?.error && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <i data-feather="alert-circle" className="w-4 h-4 text-orange-600 mr-2"></i>
              <span className="text-sm text-orange-800">
                AI analysis experienced issues - this is a conservative assessment
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Possible Causes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <i data-feather="search" className="w-5 h-5 mr-2 text-blue-600"></i>
          Possible Causes
        </h3>
        <ul className="space-y-2">
          {triageResults.possible_causes?.map((cause, index) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-gray-700">{cause}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <i data-feather="clipboard" className="w-5 h-5 mr-2 text-green-600"></i>
          Recommended Actions
        </h3>
        <ul className="space-y-3">
          {triageResults.recommended_actions?.map((action, index) => (
            <li key={index} className="flex items-start">
              <div className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5">
                <i data-feather="check" className="w-5 h-5 text-green-600"></i>
              </div>
              <span className="text-gray-700">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Medical Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <i data-feather="alert-triangle" className="w-5 h-5 text-yellow-600 mr-2"></i>
          <span className="font-medium text-yellow-800">Important Medical Disclaimer</span>
        </div>
        <p className="text-sm text-yellow-700">
          This AI analysis is for informational purposes only and is not a substitute for professional veterinary advice. 
          Always consult with a qualified veterinarian for definitive diagnosis and treatment recommendations.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleSaveToHistory}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <i data-feather="bookmark" className="w-4 h-4 inline mr-2"></i>
          Save to History
        </button>
        
        <button
          onClick={handleShareWithVet}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i data-feather="share" className="w-4 h-4 inline mr-2"></i>
          Share with Vet
        </button>
      </div>

      {/* Start New Analysis */}
      <div className="text-center pt-4">
        <button
          onClick={onStartNew}
          className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <i data-feather="plus" className="w-4 h-4 inline mr-2"></i>
          Start New Analysis
        </button>
      </div>
    </div>
  )
}

export default TriageResults
