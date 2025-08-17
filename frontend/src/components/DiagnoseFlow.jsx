import React, { useState, useEffect } from 'react'
import ImageUpload from './ImageUpload'
import QuestionForm from './QuestionForm'
import TriageResults from './TriageResults'
import CaseHistory from './CaseHistory'
import { analyzeObservations, submitAnswers, generateTriage } from '../services/api'
import { saveCaseOffline } from '../utils/offline'
import { IconContext } from "react-icons";

function DiagnoseFlow({ isOnline }) {
  const [step, setStep] = useState('upload') // upload, questions, results
  const [currentCase, setCurrentCase] = useState(null)
  const [observations, setObservations] = useState(null)
  const [questions, setQuestions] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [triageResults, setTriageResults] = useState(null)
  const [answers, setAnswers] = useState({}) // Added state for answers

  const handleImageUpload = async (uploadResult) => {
    if (!isOnline) {
      alert('Internet connection required for AI analysis')
      return
    }

    setCurrentCase(uploadResult)
    setIsAnalyzing(true)

    try {
      // Analyze with Gemini
      const analysisResult = await analyzeObservations(uploadResult.case_id)
      setObservations(analysisResult.observations)
      setQuestions(analysisResult.questions)
      setStep('questions')
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('AI analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleQuestionsComplete = async (userAnswers) => {
    if (!currentCase || !isOnline) return

    setAnswers(userAnswers); // Store the answers

    try {
      // Submit answers
      await submitAnswers(currentCase.case_id, userAnswers)

      // Generate triage
      setIsAnalyzing(true)
      const triage = await generateTriage(currentCase.case_id)
      setTriageResults(triage)

      // Save case offline for history
      const fullCase = {
        case_id: currentCase.case_id,
        timestamp: new Date().toISOString(),
        image_url: currentCase.image_url,
        observations,
        user_answers: userAnswers, // Use the submitted answers
        triage_summary: triage,
        status: 'closed'
      }
      saveCaseOffline(fullCase)

      setStep('results')

      // Show medical disclaimer
      if (window.showDisclaimer) {
        window.showDisclaimer()
      }
    } catch (error) {
      console.error('Triage generation failed:', error)
      alert('Triage analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleNewCase = () => {
    setStep('upload')
    setCurrentCase(null)
    setObservations(null)
    setQuestions([])
    setTriageResults(null)
    setAnswers({}) // Clear answers
    if (window.hideDisclaimer) {
      window.hideDisclaimer()
    }
  }

  const renderDiagnoseContent = () => {
    // Offline state check moved to the beginning for clarity
    if (!isOnline && step !== 'upload') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8 flex items-center justify-center">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-2xl flex items-center justify-center">
                {/* Feather icon for wifi-off needs to be rendered correctly, assuming you have a way to render them */}
                <svg className="w-8 h-8 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M16.73 18.34a5 5 0 0 0-7.46-0.01"></path>
                  <path d="M13.84 13.84a3 3 0 0 0-4.08 0"></path>
                  <line x1="10" y1="10" x2="10.01" y2="10"></line>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Offline Mode</h3>
              <p className="text-gray-600 mb-6">
                Internet connection required for new AI analysis. You can view your case history offline.
              </p>
              <button
                onClick={handleNewCase}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Render the main content based on the step
    if (step === 'upload') {
      return (
        <>
          <ImageUpload
            onUploadComplete={handleImageUpload}
            onUploadStart={() => setIsAnalyzing(true)}
          />
          {isAnalyzing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm mx-4">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Image...</h3>
                <p className="text-gray-600">
                  Our AI is examining the photo to identify key health indicators
                </p>
              </div>
            </div>
          )}
        </>
      )
    }

    if (step === 'questions') {
      return (
        <QuestionForm
          questions={questions}
          observations={observations}
          onSubmit={handleQuestionsComplete}
          onBack={handleNewCase}
          isSubmitting={isAnalyzing}
        />
      )
    }

    if (step === 'results') {
      return (
        <TriageResults
          triageResults={triageResults}
          caseData={currentCase}
          observations={observations}
          onStartNew={handleNewCase}
        />
      )
    }
    return null; // Should not reach here if logic is correct
  }

  const renderHistoryContent = () => {
    return <CaseHistory isOnline={isOnline} />
  }

  return (
    <IconContext.Provider value={{ size: '1.2em' }}>
      <div className="flex flex-col h-screen">
        {/* Removed Tabs component and its related structure */}
        <div className="flex-1 overflow-auto">
          {/* Render content based on the active tab equivalent */}
          {/* This logic will be managed by the step state */}
          {renderDiagnoseContent()}
        </div>

        {/* Bottom Tab Navigation - Modern Mobile App Style */}
        {/* This navigation should now control the 'step' state instead of 'activeTab' */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex justify-around items-center py-3 z-30 shadow-lg">
          <button
            onClick={() => setStep('upload')}
            className="flex flex-col items-center justify-center px-4 py-2 min-w-0 flex-1 transition-all duration-200 cursor-pointer outline-none"
          >
            <div className={`w-6 h-6 flex items-center justify-center mb-1 transition-all duration-200 ${step === 'upload' ? 'text-blue-600 scale-110' : 'text-gray-500'}`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v7c0 6 8 10 8 10z"></path>
                <path d="M12 7v5"></path>
                <path d="M12 16v-3"></path>
              </svg>
            </div>
            <span className={`text-xs font-medium transition-all duration-200 ${step === 'upload' ? 'text-blue-600' : 'text-gray-500'}`}>
              Diagnose
            </span>
          </button>
          <button
            onClick={() => {
              // Optionally, navigate to history, or keep it as a separate view
              // For now, we'll assume this button might lead to a history view if implemented separately
              // or just act as a placeholder if the history is not directly integrated into this flow.
              // If CaseHistory is a separate component rendered elsewhere, this button might trigger a navigation.
              // For this example, we'll assume it doesn't change the main `step` state directly within this component's flow.
              // If `CaseHistory` needs to be displayed, the structure would need to change significantly.
              // For now, we'll let it be a placeholder.
              console.log("History button clicked");
            }}
            className="flex flex-col items-center justify-center px-4 py-2 min-w-0 flex-1 transition-all duration-200 cursor-pointer outline-none"
          >
            <div className={`w-6 h-6 flex items-center justify-center mb-1 transition-all duration-200 ${step === 'history' ? 'text-blue-600 scale-110' : 'text-gray-500'}`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2h8.59a2 2 0 0 1 1.42.57l4.44 4.44a2 2 0 0 1 .57 1.42v10.3a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 19.5z"></path>
                <path d="M7 17L7 12"></path>
                <path d="M7 12L11 12"></path>
                <path d="M7 8L7 10"></path>
              </svg>
            </div>
            <span className={`text-xs font-medium transition-all duration-200 ${step === 'history' ? 'text-blue-600' : 'text-gray-500'}`}>
              History
            </span>
          </button>
          <button
            onClick={() => {
              // Placeholder for Connect functionality, as ConnectToVet component was removed.
              // If 'Connect' is meant to be a different screen or action, it needs to be defined.
              console.log("Connect button clicked");
            }}
            className="flex flex-col items-center justify-center px-4 py-2 min-w-0 flex-1 transition-all duration-200 cursor-pointer outline-none"
          >
            <div className={`w-6 h-6 flex items-center justify-center mb-1 transition-all duration-200 ${step === 'connect' ? 'text-blue-600 scale-110' : 'text-gray-500'}`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.75 17 12.5 22 8.25"></path>
                <path d="M14 12.5H5.5a3.5 3.5 0 0 0 0 7h1"></path>
                <path d="M9 12.5h8.5a3.5 3.5 0 0 0 0-7h-1"></path>
              </svg>
            </div>
            <span className={`text-xs font-medium transition-all duration-200 ${step === 'connect' ? 'text-blue-600' : 'text-gray-500'}`}>
              Connect
            </span>
          </button>
        </div>
      </div>
    </IconContext.Provider>
  )
}

export default DiagnoseFlow