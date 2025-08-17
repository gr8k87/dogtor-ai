const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Utility function to handle API responses
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `HTTP ${response.status}`)
  }
  return response.json()
}

// Upload case image
export async function uploadCaseImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`${API_BASE_URL}/cases/upload`, {
    method: 'POST',
    body: formData,
  })
  
  return handleResponse(response)
}

// Analyze observations with Gemini
export async function analyzeObservations(caseId) {
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}/observations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  return handleResponse(response)
}

// Submit user answers
export async function submitAnswers(caseId, answers) {
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}/answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(answers),
  })
  
  return handleResponse(response)
}

// Generate triage with OpenAI
export async function generateTriage(caseId) {
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}/triage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  return handleResponse(response)
}

// Get cases list
export async function getCases() {
  const response = await fetch(`${API_BASE_URL}/cases`)
  return handleResponse(response)
}

// Get specific case
export async function getCase(caseId) {
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}`)
  return handleResponse(response)
}
