import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const HistoryContext = createContext(null)

/**
 * History item:
 * { id: string, createdAt: number, form: any, triage: any }
 */
export function HistoryProvider({ children, persist = false }) {
  const STORAGE_KEY = 'dogtor.history.v1'

  const [items, setItems] = useState(() => {
    if (!persist) return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (!persist) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }, [items, persist])

  const api = useMemo(() => ({
    items,
    addEntry(entry) {
      const id = (crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`)
      const createdAt = Date.now()
      const newItem = { id, createdAt, ...entry }
      setItems(prev => [newItem, ...prev])
      return newItem
    },
    clear() {
      setItems([])
      if (persist) {
        try { localStorage.removeItem(STORAGE_KEY) } catch {}
      }
    }
  }), [items, persist])

  return <HistoryContext.Provider value={api}>{children}</HistoryContext.Provider>
}

export function useHistory() {
  const ctx = useContext(HistoryContext)
  if (!ctx) throw new Error('useHistory must be used inside <HistoryProvider>')
  return ctx
}
