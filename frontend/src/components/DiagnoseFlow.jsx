
import React, { useState, useEffect } from 'react'
import ImageUpload from './ImageUpload'
import QuestionForm from './QuestionForm'
import TriageResults from './TriageResults'
import { analyzeObservations, submitAnswers, generateTriage } from '../services/api'
import { saveCaseOffline } from '../utils/offline'

function DiagnoseFlow({ isOnline, activeTab, setActiveTab }) {
  const [step, setStep] = useState('upload') // upload, questions, results
  const [currentCase, setCurrentCase] = useState(null)
  const [observations, setObservations] = useState(null)
  const [questions, setQuestions] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [triageResults, setTriageResults] = useState(null)
  const [answers, setAnswers] = useState({})

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

    setAnswers(userAnswers)

    try {
      // Submit answers
      await submitAnswers(currentCase.case_id, userAnswers)

      // Generate triage
      setIsAnalyzing(true)
      const triage = await generateTriage(currentCase.case_id)
      setTriageResults(triage)

      // Save case offline for history
      if (isOnline) {
        saveCaseOffline({
          case_id: currentCase.case_id,
          image_url: currentCase.image_url,
          observations,
          answers: userAnswers,
          triage,
          created_at: new Date().toISOString()
        })
      }

      setStep('results')
    } catch (error) {
      console.error('Triage generation failed:', error)
      alert('Failed to generate triage. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRestart = () => {
    setStep('upload')
    setCurrentCase(null)
    setObservations(null)
    setQuestions([])
    setTriageResults(null)
    setAnswers({})
  }

  const handleBackToQuestions = () => {
    setStep('questions')
  }

  const handleBackToUpload = () => {
    setStep('upload')
  }

  // Render different steps
  if (step === 'upload') {
    return (
      <ImageUpload 
        onUploadSuccess={handleImageUpload}
        isAnalyzing={isAnalyzing}
        isOnline={isOnline}
      />
    )
  }

  if (step === 'questions') {
    return (
      <QuestionForm
        questions={questions}
        observations={observations}
        onSubmit={handleQuestionsComplete}
        onBack={handleBackToUpload}
        isSubmitting={isAnalyzing}
      />
    )
  }

  if (step === 'results') {
    return (
      <TriageResults
        results={triageResults}
        caseData={currentCase}
        onRestart={handleRestart}
        onBack={handleBackToQuestions}
        onSaveToHistory={() => setActiveTab('history')}
      />
    )
  }

  return null
}

export default DiagnoseFlow
