
import React, { useState } from 'react'
import ImageUpload from './ImageUpload'
import QuestionForm from './QuestionForm'
import TriageResults from './TriageResults'
import CaseHistory from './CaseHistory'
import { analyzeObservations, submitAnswers, generateTriage } from '../services/api'
import { saveCaseOffline } from '../utils/offline'
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { FaShieldAlt, FaBookOpen, FaPlug } from 'react-icons/fa';
import { IconContext } from "react-icons";

function DiagnoseFlow({ isOnline }) {
  const [step, setStep] = useState('upload') // upload, questions, results
  const [activeTab, setActiveTab] = useState(0) // 0: diagnose, 1: history, 2: connect
  const [currentCase, setCurrentCase] = useState(null)
  const [observations, setObservations] = useState(null)
  const [questions, setQuestions] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [triageResults, setTriageResults] = useState(null)

  const handleUploadComplete = async (uploadResult) => {
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

  const handleAnswersSubmit = async (answers) => {
    if (!currentCase || !isOnline) return

    try {
      // Submit answers
      await submitAnswers(currentCase.case_id, answers)

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
        user_answers: answers,
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

  const handleStartNew = () => {
    setStep('upload')
    setCurrentCase(null)
    setObservations(null)
    setQuestions([])
    setTriageResults(null)
    if (window.hideDisclaimer) {
      window.hideDisclaimer()
    }
  }

  const renderDiagnoseContent = () => {
    // Offline state
    if (!isOnline && step !== 'upload') {
      return (
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <i data-feather="wifi-off" className="w-8 h-8 text-yellow-600"></i>
            </div>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Offline Mode</h3>
            <p className="text-yellow-700 mb-4">
              Internet connection required for new AI analysis. You can view your case history offline.
            </p>
            <button
              onClick={handleStartNew}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    if (step === 'upload') {
      return (
        <>
          <ImageUpload
            onUploadComplete={handleUploadComplete}
            onUploadStart={() => setIsAnalyzing(true)}
          />
          {isAnalyzing && (
            <div className="max-w-2xl mx-auto p-4">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Image...</h3>
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
          onSubmit={handleAnswersSubmit}
          onBack={handleStartNew}
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
          onStartNew={handleStartNew}
        />
      )
    }
  }

  const renderHistoryContent = () => {
    return <CaseHistory isOnline={isOnline} />
  }

  const renderConnectContent = () => {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <FaPlug className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Connect with a Veterinarian</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Export your case data to share with your veterinarian or connect with partner clinics.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Coming Soon:</strong> Direct integration with veterinary partners for seamless case sharing.
              </p>
            </div>
            <p className="text-xs text-gray-500">
              For now, use the Export JSON feature in case history to share your analysis with your vet.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <IconContext.Provider value={{ size: '1.5em' }}>
      <div className="flex flex-col h-screen pb-16">
        <Tabs 
          selectedIndex={activeTab} 
          onSelect={(index) => setActiveTab(index)}
          className="flex flex-col h-full"
        >
          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            <TabPanel>
              {renderDiagnoseContent()}
            </TabPanel>
            <TabPanel>
              {renderHistoryContent()}
            </TabPanel>
            <TabPanel>
              {renderConnectContent()}
            </TabPanel>
          </div>

          {/* Bottom Tab Navigation - Mobile App Style */}
          <TabList className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 z-30">
            <Tab className="flex flex-col items-center justify-center px-3 py-2 min-w-0 flex-1 transition-colors cursor-pointer outline-none">
              <div className={`w-6 h-6 flex items-center justify-center mb-1 ${activeTab === 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                <FaShieldAlt />
              </div>
              <span className={`text-xs font-medium ${activeTab === 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                Diagnose
              </span>
            </Tab>
            <Tab className="flex flex-col items-center justify-center px-3 py-2 min-w-0 flex-1 transition-colors cursor-pointer outline-none">
              <div className={`w-6 h-6 flex items-center justify-center mb-1 ${activeTab === 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                <FaBookOpen />
              </div>
              <span className={`text-xs font-medium ${activeTab === 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                History
              </span>
            </Tab>
            <Tab className="flex flex-col items-center justify-center px-3 py-2 min-w-0 flex-1 transition-colors cursor-pointer outline-none">
              <div className={`w-6 h-6 flex items-center justify-center mb-1 ${activeTab === 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                <FaPlug />
              </div>
              <span className={`text-xs font-medium ${activeTab === 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                Connect
              </span>
            </Tab>
          </TabList>
        </Tabs>
      </div>
    </IconContext.Provider>
  )
}

export default DiagnoseFlow
