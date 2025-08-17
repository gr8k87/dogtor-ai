
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
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8 flex items-center justify-center">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <i data-feather="wifi-off" className="w-8 h-8 text-yellow-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Offline Mode</h3>
              <p className="text-gray-600 mb-6">
                Internet connection required for new AI analysis. You can view your case history offline.
              </p>
              <button
                onClick={handleStartNew}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                Try Again
              </button>
            </div>
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaPlug className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect with Vets</h1>
            <p className="text-gray-600">Share your analysis with professionals</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Direct integration with veterinary partners for seamless case sharing and professional consultations.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 text-sm">
                <strong>For now:</strong> Use the Export feature in case history to share your analysis with your veterinarian.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">What's Coming</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i data-feather="video" className="w-4 h-4 text-blue-600"></i>
                </div>
                <span className="text-gray-700">Video consultations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <i data-feather="map-pin" className="w-4 h-4 text-green-600"></i>
                </div>
                <span className="text-gray-700">Find nearby clinics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i data-feather="share-2" className="w-4 h-4 text-purple-600"></i>
                </div>
                <span className="text-gray-700">Direct case sharing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <IconContext.Provider value={{ size: '1.2em' }}>
      <div className="flex flex-col h-screen">
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

          {/* Bottom Tab Navigation - Modern Mobile App Style */}
          <TabList className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex justify-around items-center py-3 z-30 shadow-lg">
            <Tab className="flex flex-col items-center justify-center px-4 py-2 min-w-0 flex-1 transition-all duration-200 cursor-pointer outline-none">
              <div className={`w-6 h-6 flex items-center justify-center mb-1 transition-all duration-200 ${activeTab === 0 ? 'text-blue-600 scale-110' : 'text-gray-500'}`}>
                <FaShieldAlt />
              </div>
              <span className={`text-xs font-medium transition-all duration-200 ${activeTab === 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                Diagnose
              </span>
            </Tab>
            <Tab className="flex flex-col items-center justify-center px-4 py-2 min-w-0 flex-1 transition-all duration-200 cursor-pointer outline-none">
              <div className={`w-6 h-6 flex items-center justify-center mb-1 transition-all duration-200 ${activeTab === 1 ? 'text-blue-600 scale-110' : 'text-gray-500'}`}>
                <FaBookOpen />
              </div>
              <span className={`text-xs font-medium transition-all duration-200 ${activeTab === 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                History
              </span>
            </Tab>
            <Tab className="flex flex-col items-center justify-center px-4 py-2 min-w-0 flex-1 transition-all duration-200 cursor-pointer outline-none">
              <div className={`w-6 h-6 flex items-center justify-center mb-1 transition-all duration-200 ${activeTab === 2 ? 'text-blue-600 scale-110' : 'text-gray-500'}`}>
                <FaPlug />
              </div>
              <span className={`text-xs font-medium transition-all duration-200 ${activeTab === 2 ? 'text-blue-600' : 'text-gray-500'}`}>
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
