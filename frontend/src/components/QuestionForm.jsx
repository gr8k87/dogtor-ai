import React, { useState } from 'react'

function QuestionForm({ questions, observations, onSubmit, onBack, isSubmitting }) {
  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState({})

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    
    // Clear error when user provides answer
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    questions.forEach(question => {
      if (question.required && !answers[question.id]) {
        newErrors[question.id] = 'This field is required'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(answers)
    }
  }

  const renderQuestion = (question) => {
    const value = answers[question.id] || ''
    const hasError = errors[question.id]
    
    const baseInputClasses = `
      w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      ${hasError ? 'border-red-300' : 'border-gray-300'}
    `

    switch (question.type) {
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className={baseInputClasses}
            min="0"
            step="1"
          />
        )
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className={baseInputClasses}
          >
            <option value="">Select an option...</option>
            {question.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      
      case 'text':
      default:
        return (
          <textarea
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className={`${baseInputClasses} resize-none`}
            rows="3"
          />
        )
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Additional Information Needed
          </h2>
          
          {/* Show AI observations summary */}
          {observations && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">AI Analysis Summary:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Consistency:</strong> {observations.consistency}</p>
                <p><strong>Color:</strong> {observations.color}</p>
                {observations.blood !== 'none' && (
                  <p><strong>Blood:</strong> {observations.blood}</p>
                )}
                {observations.mucus && (
                  <p><strong>Mucus:</strong> Present</p>
                )}
                {observations.notes && (
                  <p><strong>Notes:</strong> {observations.notes}</p>
                )}
              </div>
            </div>
          )}
          
          <p className="text-gray-600">
            Please answer the following questions to help us provide better recommendations:
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map(question => (
            <div key={question.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {question.label}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {renderQuestion(question)}
              
              {errors[question.id] && (
                <p className="text-sm text-red-600">{errors[question.id]}</p>
              )}
            </div>
          ))}

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              <i data-feather="arrow-left" className="w-4 h-4 inline mr-2"></i>
              Back
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <i data-feather="check" className="w-4 h-4 inline mr-2"></i>
                  Get Triage Results
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuestionForm
