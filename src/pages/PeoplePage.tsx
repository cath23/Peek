import { useState, useRef, useEffect } from 'react'
import { AppShell } from '@/layouts/AppShell'
import { ContainerHeader } from '@/components/ContainerHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { PersonRow } from '@/components/ui/PersonRow'
import { Divider } from '@/components/ui/Divider'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StarredSection } from '@/components/ui/StarredSection'
import { ComposeBox, type SendPayload } from '@/components/ui/ComposeBox'
import { ConversationHeader } from '@/components/ConversationHeader'
import { ConversationCard } from '@/components/ConversationCard'
import { ThreadPanel } from '@/components/ThreadPanel'
import { DateDivider } from '@/components/ui/DateDivider'
import { DM_CONVERSATIONS } from '@/data/dmData'
import { REPLIES, type ReplyData } from '@/data/replyData'
import { type ConversationData } from '@/data/topicData'

const DMS = [
  { id: 1, name: 'Alice Johnson', isUnread: false },
  { id: 2, name: 'Bob Smith',     isUnread: false },
  { id: 3, name: 'Carol White',   isUnread: false },
]

const TEAMS = [
  { id: 10, name: 'Account Management' },
  { id: 11, name: 'Designers' },
  { id: 12, name: 'Engineering' },
]

const ALL_ITEMS = [...DMS, ...TEAMS]
const DM_IDS = new Set(DMS.map((d) => d.id))

const sortedDms = [...DMS].sort((a, b) => Number(b.isUnread) - Number(a.isUnread))

export function PeoplePage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [teamsExpanded, setTeamsExpanded] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Sent messages per DM
  const [sentMessages, setSentMessages] = useState<Record<number, ConversationData[]>>({})
  // Deleted conversation ids
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  // Resolved state tracking
  const [resolvedOverrides, setResolvedOverrides] = useState<Record<string, { resolved: boolean; resolvedBy?: string; message?: string }>>({})

  // Thread state
  const [threadConvId, setThreadConvId] = useState<string | null>(null)
  const [sentReplies, setSentReplies] = useState<Record<string, ReplyData[]>>({})

  const selectedItem = selectedId ? ALL_ITEMS.find((i) => i.id === selectedId) : null
  const isDm = selectedId != null && DM_IDS.has(selectedId)
  const dmGroups = selectedId != null ? (DM_CONVERSATIONS[selectedId] ?? []) : []
  const currentSent = selectedId != null ? (sentMessages[selectedId] ?? []) : []

  // Find the conversation currently open in thread
  const allConvs = [...dmGroups.flatMap((g) => g.convs), ...currentSent]
  const threadConv = threadConvId ? allConvs.find((c) => c.id === threadConvId) : null
  const threadReplies = threadConvId ? (REPLIES[threadConvId] ?? []) : []
  const threadSentReplies = threadConvId ? (sentReplies[threadConvId] ?? []) : []

  const isConvResolved = (id: string, initial = false) =>
    resolvedOverrides[id]?.resolved ?? initial
  const getConvResolvedBy = (id: string, initial = '') =>
    resolvedOverrides[id]?.resolvedBy ?? initial
  const getConvResolutionMsg = (id: string, initial = '') =>
    resolvedOverrides[id]?.message ?? initial

  const handleResolvedChange = (id: string, resolved: boolean, resolvedBy?: string, message?: string) =>
    setResolvedOverrides((prev) => ({ ...prev, [id]: { resolved, resolvedBy, message } }))

  const openThread = (convId: string) => setThreadConvId(convId)
  const closeThread = () => setThreadConvId(null)

  const handleSendReply = ({ text, resolution }: SendPayload) => {
    if (!threadConvId) return
    if (text) {
      const newReply: ReplyData = {
        id: `reply_${Date.now()}`,
        authorName: 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        body: text,
      }
      setSentReplies((prev) => ({
        ...prev,
        [threadConvId]: [...(prev[threadConvId] ?? []), newReply],
      }))
    }
    if (resolution) {
      handleResolvedChange(threadConvId, true, 'You', resolution.message)
    }
  }

  const handleDeleteReply = (replyId: string) => {
    if (!threadConvId) return
    setSentReplies((prev) => ({
      ...prev,
      [threadConvId]: (prev[threadConvId] ?? []).filter((r) => r.id !== replyId),
    }))
  }

  const handleSend = ({ text, resolution }: SendPayload) => {
    if (selectedId == null) return
    if (text) {
      const newMsg: ConversationData = {
        id: `sent_${Date.now()}`,
        authorName: 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        body: text,
        isResolved: resolution ? true : undefined,
        resolvedBy: resolution ? 'You' : undefined,
        resolutionMessage: resolution?.message || undefined,
      }
      setSentMessages((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), newMsg],
      }))
    } else if (resolution) {
      // Resolution only (no text) — resolve the last conversation
      setSentMessages((prev) => {
        const msgs = prev[selectedId] ?? []
        if (msgs.length === 0) return prev
        const updated = [...msgs]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          isResolved: true,
          resolvedBy: 'You',
          resolutionMessage: resolution.message || undefined,
        }
        return { ...prev, [selectedId]: updated }
      })
    }
  }

  const handleDelete = (id: string) => {
    if (selectedId == null) return
    setSentMessages((prev) => ({
      ...prev,
      [selectedId]: (prev[selectedId] ?? []).filter((m) => m.id !== id),
    }))
    setDeletedIds((prev) => new Set([...prev, id]))
  }

  // Close thread when switching DMs
  useEffect(() => {
    setThreadConvId(null)
  }, [selectedId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedId])

  // Scroll to bottom whenever a new message is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentSent.length])

  return (
    <AppShell
      leftPanel={
        <div className="flex flex-col h-full">
          <ContainerHeader
            title="People"
            prop1stAction
            prop1stActionTooltip="New conversation"
            prop2ndAction
            prop2ndActionTooltip="Sort by"
          />
          <div className="flex-1 overflow-y-auto pt-4 pb-3 px-3 flex flex-col gap-1">
            <StarredSection
              selectedId={selectedId}
              onSelect={setSelectedId}
            />

            <Divider className="my-2" />

            {sortedDms.map((dm) => (
              <PersonRow
                key={dm.id}
                name={dm.name}
                type="DM"
                isUnread={dm.isUnread}
                isSelected={selectedId === dm.id}
                onClick={() => setSelectedId(dm.id)}
              />
            ))}

            <Divider className="my-2" />

            <SectionHeader
              title="Teams"
              chevron
              isExpanded={teamsExpanded}
              onToggle={() => setTeamsExpanded((v) => !v)}
            />

            {teamsExpanded && TEAMS.map((t) => (
              <PersonRow
                key={t.id}
                name={t.name}
                type="team"
                isSelected={selectedId === t.id}
                onClick={() => setSelectedId(t.id)}
              />
            ))}
          </div>
        </div>
      }
      rightPanel={
        selectedItem ? (
          isDm ? (
            <div className="flex flex-col h-full">
              <ConversationHeader name={selectedItem.name} />
              <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col">
                <div className="flex-1 min-h-0" />
                <div className="shrink-0 flex flex-col px-4 py-4 gap-2">
                  {dmGroups.map((group) => (
                    <div key={group.dateLabel} className="flex flex-col gap-2">
                      <DateDivider
                        label={group.dateLabel}
                        className="sticky top-0 z-10 bg-bg-surface"
                      />
                      {group.convs.filter((c) => !deletedIds.has(c.id)).map((c) => (
                        <ConversationCard
                          key={`${selectedId}_${c.id}`}
                          authorName={c.authorName}
                          timestamp={c.timestamp}
                          body={c.body}
                          reactions={c.reactions}
                          replyCount={(c.replyCount ?? 0) + (sentReplies[c.id]?.length ?? 0)}
                          hasNewReply={c.hasNewReply}
                          isResolved={isConvResolved(c.id, c.isResolved)}
                          resolvedBy={getConvResolvedBy(c.id, c.resolvedBy)}
                          resolutionMessage={getConvResolutionMsg(c.id, c.resolutionMessage)}
                          isSelected={threadConvId === c.id}
                          onResolvedChange={(resolved) => handleResolvedChange(c.id, resolved, resolved ? 'You' : undefined)}
                          onClick={() => openThread(c.id)}
                          onReply={() => openThread(c.id)}
                          onDelete={() => handleDelete(c.id)}
                        />
                      ))}
                    </div>
                  ))}

                  {/* Sent messages */}
                  {currentSent.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <DateDivider label="Today" className="sticky top-0 z-10 bg-bg-surface" />
                      {currentSent.map((m) => (
                        <ConversationCard
                          key={m.id}
                          authorName={m.authorName}
                          timestamp={m.timestamp}
                          body={m.body}
                          isResolved={isConvResolved(m.id, m.isResolved)}
                          resolvedBy={getConvResolvedBy(m.id, m.resolvedBy)}
                          resolutionMessage={getConvResolutionMsg(m.id, m.resolutionMessage)}
                          isSelected={threadConvId === m.id}
                          onResolvedChange={(resolved) => handleResolvedChange(m.id, resolved, resolved ? 'You' : undefined)}
                          onClick={() => openThread(m.id)}
                          onReply={() => openThread(m.id)}
                          onDelete={() => handleDelete(m.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-3">
                <ComposeBox onSend={handleSend} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <EmptyState />
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center h-full">
            <EmptyState />
          </div>
        )
      }
      threadPanel={
        threadConv ? (
          <ThreadPanel
            conversation={threadConv}
            replies={threadReplies}
            sentReplies={threadSentReplies}
            isResolved={isConvResolved(threadConv.id, threadConv.isResolved)}

            onClose={closeThread}
            onSendReply={handleSendReply}
            onDeleteReply={handleDeleteReply}
          />
        ) : undefined
      }
    />
  )
}
