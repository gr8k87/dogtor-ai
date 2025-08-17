
// Offline storage utilities for PWA functionality

const STORAGE_KEY = 'dogtor_offline_cases'
const DB_VERSION = 1

// Initialize offline storage
export function initOfflineStorage() {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    }
    console.log('Offline storage initialized')
    return true
  } catch (error) {
    console.error('Failed to initialize offline storage:', error)
    return false
  }
}

// Save case data offline
export function saveCaseOffline(caseData) {
  try {
    const existingCases = getCasesOffline()
    const updatedCases = [...existingCases, {
      ...caseData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      offline: true
    }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCases))
    console.log('Case saved offline:', caseData.id)
    return true
  } catch (error) {
    console.error('Failed to save case offline:', error)
    return false
  }
}

// Get offline cases
export function getCasesOffline() {
  try {
    const cases = localStorage.getItem(STORAGE_KEY)
    return cases ? JSON.parse(cases) : []
  } catch (error) {
    console.error('Failed to get offline cases:', error)
    return []
  }
}

// Clear offline storage
export function clearOfflineStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('Offline storage cleared')
    return true
  } catch (error) {
    console.error('Failed to clear offline storage:', error)
    return false
  }
}

// Check if online
export function isOnline() {
  return navigator.onLine
}

// Update case offline
export function updateCaseOffline(caseId, updates) {
  try {
    const cases = getCasesOffline()
    const updatedCases = cases.map(c => 
      c.id === caseId ? { ...c, ...updates } : c
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCases))
    return true
  } catch (error) {
    console.error('Failed to update case offline:', error)
    return false
  }
}

// Get single case offline
export function getCaseOffline(caseId) {
  try {
    const cases = getCasesOffline()
    return cases.find(c => c.id === caseId) || null
  } catch (error) {
    console.error('Failed to get case offline:', error)
    return null
  }
}
