const OFFLINE_STORAGE_KEY = 'dogtor_offline_cases'
const MAX_OFFLINE_CASES = 10

// Initialize offline storage
export function initOfflineStorage() {
  if (!localStorage.getItem(OFFLINE_STORAGE_KEY)) {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify([]))
  }
}

// Save case to offline storage
export function saveCaseOffline(caseData) {
  try {
    const existingCases = getCasesOffline()
    
    // Remove existing case with same ID if present
    const filteredCases = existingCases.filter(c => c.case_id !== caseData.case_id)
    
    // Add new case at beginning
    const updatedCases = [caseData, ...filteredCases]
    
    // Limit to max cases
    const limitedCases = updatedCases.slice(0, MAX_OFFLINE_CASES)
    
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(limitedCases))
    
    console.log('Case saved offline:', caseData.case_id)
  } catch (error) {
    console.error('Failed to save case offline:', error)
  }
}

// Get cases from offline storage
export function getCasesOffline() {
  try {
    const casesJson = localStorage.getItem(OFFLINE_STORAGE_KEY)
    return casesJson ? JSON.parse(casesJson) : []
  } catch (error) {
    console.error('Failed to load offline cases:', error)
    return []
  }
}

// Clear offline storage
export function clearOfflineStorage() {
  localStorage.removeItem(OFFLINE_STORAGE_KEY)
  initOfflineStorage()
}

// Sync offline cases with server (future enhancement)
export async function syncOfflineCases() {
  // This would sync offline cases with the server when connection is restored
  // Implementation depends on specific sync strategy
  console.log('Offline sync not implemented yet')
}
