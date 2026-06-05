import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'

interface LastSelectionState {
  topicId: string | null
  dmId: number | null
  /** One-shot: when set, the next mounted DM view should auto-open this thread, then clear. */
  pendingDmThreadId: string | null
}

interface LastSelectionValue extends LastSelectionState {
  setLastTopicId: (id: string | null) => void
  setLastDmId: (id: number | null) => void
  setPendingDmThreadId: (id: string | null) => void
}

const LastSelectionContext = createContext<LastSelectionValue | null>(null)

export function LastSelectionProvider({ children }: { children: ReactNode }) {
  const [topicId, setLastTopicId] = useState<string | null>(null)
  const [dmId, setLastDmId] = useState<number | null>(null)
  const [pendingDmThreadId, setPendingDmThreadId] = useState<string | null>(null)

  const value = useMemo<LastSelectionValue>(
    () => ({ topicId, dmId, pendingDmThreadId, setLastTopicId, setLastDmId, setPendingDmThreadId }),
    [topicId, dmId, pendingDmThreadId],
  )

  return <LastSelectionContext.Provider value={value}>{children}</LastSelectionContext.Provider>
}

export function useLastSelection(): LastSelectionValue {
  const ctx = useContext(LastSelectionContext)
  if (!ctx) throw new Error('useLastSelection must be used within LastSelectionProvider')
  return ctx
}
