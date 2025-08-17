import React from 'react'

function Home({ onStartDiagnosis, onViewHistory }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6 flex flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Dogtor AI</h1>
      <button
        onClick={onStartDiagnosis}
        className="w-full max-w-xs py-3 px-4 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-colors"
      >
        Start Diagnosis
      </button>
      <button
        onClick={onViewHistory}
        className="w-full max-w-xs py-3 px-4 bg-white text-blue-600 border border-blue-600 rounded-xl shadow hover:bg-blue-50 transition-colors"
      >
        View Case History
      </button>
    </div>
  )
}

export default Home
