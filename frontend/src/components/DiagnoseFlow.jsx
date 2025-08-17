import React, { useState } from 'react'
import ImageUpload from './ImageUpload'
import QuestionForm from './QuestionForm'
import TriageResults from './TriageResults'
import { analyzeObservations, submitAnswers, generateTriage } from '../services/api'
import { saveCaseOffline } from '../utils/offline'
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { FaShieldAlt, FaBookOpen, FaPlug } from 'react-icons/fa';
import { IconContext } from "react-icons";


function DiagnoseFlow({ isOnline }) {
  const [step, setStep] = useState('upload') // upload, questions, results
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

  return (
    <IconContext.Provider value={{ size: '1.5em', className: 'global-class-name' }}>
      <Tabs selectedTabClassName="bg-blue-600 text-white" className="flex flex-col md:flex-row">
        <TabList className="flex justify-around md:flex-col md:w-24 p-2 bg-gray-100 md:h-screen">
          <Tab
            onClick={() => setStep('upload')}
            className="p-3 cursor-pointer rounded-md text-center transition duration-200 ease-in-out hover:bg-gray-200 focus:outline-none"
          >
            <div className="flex flex-col items-center">
              <FaShieldAlt />
              <span className="text-xs mt-1">Diagnose</span>
            </div>
          </Tab>
          <Tab
            onClick={() => setStep('history')} // Assuming 'history' is a new state for history view
            className="p-3 cursor-pointer rounded-md text-center transition duration-200 ease-in-out hover:bg-gray-200 focus:outline-none"
          >
            <div className="flex flex-col items-center">
              <FaBookOpen />
              <span className="text-xs mt-1">History</span>
            </div>
          </Tab>
          <Tab
            onClick={() => setStep('connect')} // Assuming 'connect' is a new state for connect view
            className="p-3 cursor-pointer rounded-md text-center transition duration-200 ease-in-out hover:bg-gray-200 focus:outline-none"
          >
            <div className="flex flex-col items-center">
              <FaPlug />
              <span className="text-xs mt-1">Connect</span>
            </div>
          </Tab>
        </TabList>

        <TabPanel className="w-full p-4">
          {step === 'upload' && (
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
          )}
          {step === 'questions' && (
            <QuestionForm
              questions={questions}
              observations={observations}
              onSubmit={handleAnswersSubmit}
              onBack={handleStartNew}
              isSubmitting={isAnalyzing}
            />
          )}
          {step === 'results' && (
            <TriageResults
              triageResults={triageResults}
              caseData={currentCase}
              observations={observations}
              onStartNew={handleStartNew}
            />
          )}
        </TabPanel>
        <TabPanel className="w-full p-4">
          {/* History Content Placeholder */}
          <h2 className="text-2xl font-bold mb-4">Case History</h2>
          <p>Your past consultations will be listed here.</p>
          {/* Add actual history component or logic here */}
        </TabPanel>
        <TabPanel className="w-full p-4">
          {/* Connect Content Placeholder */}
          <h2 className="text-2xl font-bold mb-4">Connect</h2>
          <p>Information about connecting with healthcare providers.</p>
          {/* Add actual connect component or logic here */}
        </TabPanel>
      </Tabs>
    </IconContext.Provider>
  );
}

export default DiagnoseFlow