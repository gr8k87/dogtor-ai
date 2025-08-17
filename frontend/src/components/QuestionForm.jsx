
import React, { useState } from 'react'

function QuestionForm({ questions, observations, onSubmit, onBack, isSubmitting }) {
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(answers)
  }

  const isCurrentAnswered = questions[currentQuestion] && answers[questions[currentQuestion].id]
  const allAnswered = questions.every(q => answers[q.id])
  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6 pb-24">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <i data-feather="arrow-left" className="w-5 h-5 text-gray-600"></i>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Health Questions</h1>
            <div className="w-10 h-10"></div>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-white rounded-full p-1 shadow-sm">
            <div className="bg-gray-200 rounded-full h-2 relative overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {/* AI Observations Summary */}
        {observations && currentQuestion === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <i data-feather="eye" className="w-5 h-5 text-blue-600"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Observations</h3>
                <p className="text-sm text-gray-600">What we detected</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="font-medium text-blue-900">Consistency</p>
                <p className="text-blue-800">{observations.consistency}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="font-medium text-blue-900">Color</p>
                <p className="text-blue-800">{observations.color}</p>
              </div>
              {observations.blood !== 'none' && (
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="font-medium text-red-900">Blood</p>
                  <p className="text-red-800">{observations.blood}</p>
                </div>
              )}
              {observations.mucus && (
                <div className="bg-yellow-50 rounded-xl p-3">
                  <p className="font-medium text-yellow-900">Mucus</p>
                  <p className="text-yellow-800">Present</p>
                </div>
              )}
            </div>
            {observations.notes && (
              <div className="mt-4 bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-gray-900 mb-1">Additional Notes</p>
                <p className="text-gray-700 text-sm">{observations.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-relaxed">
            {question.question}
          </h3>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerChange(question.id, option)}
                className={`
                  w-full p-4 text-left rounded-xl border-2 transition-all duration-200
                  ${answers[question.id] === option
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${answers[question.id] === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                    }
                  `}>
                    {answers[question.id] === option && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-3">
          {currentQuestion < questions.length - 1 ? (
            <div className="flex space-x-3">
              {currentQuestion > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!isCurrentAnswered}
                className={`
                  flex-1 px-6 py-4 rounded-xl font-medium transition-colors
                  ${isCurrentAnswered
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Next
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={handlePrevious}
                className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                className={`
                  flex-1 px-6 py-4 rounded-xl font-medium transition-colors
                  ${allAnswered && !isSubmitting
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Complete Analysis'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuestionForm
