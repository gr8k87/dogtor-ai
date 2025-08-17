
// Offline storage utilities for PWA functionality

const STORAGE_KEY = 'dogtor_offline_cases'

export function initOfflineStorage() {
  try {
    // Initialize localStorage if not exists
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    }
    console.log('Offline storage initialized')
  } catch (error) {
    console.error('Failed to initialize offline storage:', error)
  }
}

export function saveCaseOffline(caseData) {
  try {
    const cases = getCasesOffline()
    const updatedCases = [...cases, { ...caseData, id: Date.now(), timestamp: new Date().toISOString() }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCases))
    return true
  } catch (error) {
    console.error('Failed to save case offline:', error)
    return false
  }
}

export function getCasesOffline() {
  try {
    const cases = localStorage.getItem(STORAGE_KEY)
    return cases ? JSON.parse(cases) : []
  } catch (error) {
    console.error('Failed to get offline cases:', error)
    return []
  }
}

export function clearOfflineStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear offline storage:', error)
    return false
  }
}

export function syncOfflineCases() {
  // This would sync offline cases when connection is restored
  // Implementation depends on backend API
  const cases = getCasesOffline()
  console.log(`Found ${cases.length} offline cases to sync`)
  return cases
}
