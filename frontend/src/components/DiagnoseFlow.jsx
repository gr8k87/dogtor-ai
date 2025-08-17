
import React, { useState } from 'react'
import ImageUpload from './ImageUpload'
import QuestionForm from './QuestionForm'
import TriageResults from './TriageResults'
import { uploadCaseImage, analyzeObservations, submitAnswers, generateTriage } from '../services/api'
import { saveCaseOffline, isOnline } from '../utils/offline'

function DiagnoseFlow({ onBack }) {
  const [currentStep, setCurrentStep] = useState('upload')
  const [caseId, setCaseId] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [observations, setObservations] = useState(null)
  const [questions, setQuestions] = useState([])
  const [triageResult, setTriageResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleImageUpload = async (file) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Upload image
      const uploadResult = await uploadCaseImage(file)
      setCaseId(uploadResult.case_id)
      setImageUrl(uploadResult.image_url)
      
      // Analyze with AI
      const analysisResult = await analyzeObservations(uploadResult.case_id)
      setObservations(analysisResult.observations)
      setQuestions(analysisResult.questions || [])
      
      setCurrentStep('questions')
    } catch (err) {
      console.error('Upload/analysis failed:', err)
      setError(err.message || 'Failed to process image')
      
      // Save offline if possible
      if (!isOnline()) {
        const offlineCase = {
          imageFile: file,
          timestamp: new Date().toISOString(),
          status: 'offline'
        }
        saveCaseOffline(offlineCase)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswersSubmit = async (answers) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Submit answers
      await submitAnswers(caseId, answers)
      
      // Generate triage
      const triage = await generateTriage(caseId)
      setTriageResult(triage)
      
      setCurrentStep('results')
    } catch (err) {
      console.error('Answer submission failed:', err)
      setError(err.message || 'Failed to process answers')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestart = () => {
    setCaseId(null)
    setImageUrl(null)
    setObservations(null)
    setQuestions([])
    setTriageResult(null)
    setError(null)
    setCurrentStep('upload')
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <ImageUpload 
            onImageUpload={handleImageUpload}
            onBack={onBack}
            isLoading={isLoading}
            error={error}
          />
        )
      case 'questions':
        return (
          <QuestionForm
            questions={questions}
            observations={observations}
            onSubmit={handleAnswersSubmit}
            onBack={() => setCurrentStep('upload')}
            isSubmitting={isLoading}
          />
        )
      case 'results':
        return (
          <TriageResults
            triageResult={triageResult}
            imageUrl={imageUrl}
            observations={observations}
            onRestart={handleRestart}
            onBack={onBack}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      {renderCurrentStep()}
    </div>
  )
}

export default DiagnoseFlow
