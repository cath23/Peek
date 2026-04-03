import { useState, useRef, useEffect } from 'react'
import { AppShell } from '@/layouts/AppShell'
import { ContainerHeader } from '@/components/ContainerHeader'
import { ConversationHeader } from '@/components/ConversationHeader'
import { ConversationCard } from '@/components/ConversationCard'
import { ThreadPanel } from '@/components/ThreadPanel'
import { DateDivider } from '@/components/ui/DateDivider'
import { ComposeBox, type SendPayload } from '@/components/ui/ComposeBox'
import { PersonRow } from '@/components/ui/PersonRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { TOPICS, TOPIC_CONVERSATIONS, type ConversationData } from '@/data/topicData'
import { REPLIES, type ReplyData } from '@/data/replyData'

export function TopicsPage() {
  const [selectedId, setSelectedId] = useState<string>('3')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Tracks explicit resolve/reopen actions keyed by conversation id
  const [resolvedOverrides, setResolvedOverrides] = useState<Record<string, { resolved: boolean; resolvedBy?: string; message?: string }>>({})

  // Sent messages per topic
  const [sentMessages, setSentMessages] = useState<Record<string, ConversationData[]>>({})
  // Deleted conversation ids (static data)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  // Thread state
  const [threadConvId, setThreadConvId] = useState<string | null>(null)
  const [sentReplies, setSentReplies] = useState<Record<string, ReplyData[]>>({})

  const selectedTopic = TOPICS.find((t) => t.id === selectedId) ?? null
  const currentGroups = TOPIC_CONVERSATIONS[selectedId] ?? []
  const currentSent = sentMessages[selectedId] ?? []

  const allCurrentConvs = [
    ...currentGroups.flatMap((g) => g.convs).filter((c) => !deletedIds.has(c.id)),
    ...currentSent,
  ]

  // Thread helpers
  const threadConv = threadConvId ? allCurrentConvs.find((c) => c.id === threadConvId) : null
  const threadReplies = threadConvId ? (REPLIES[threadConvId] ?? []) : []
  const threadSentReplies = threadConvId ? (sentReplies[threadConvId] ?? []) : []

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

  const isConvResolved = (id: string, initial = false) =>
    resolvedOverrides[id]?.resolved ?? initial
  const getConvResolvedBy = (id: string, initial = '') =>
    resolvedOverrides[id]?.resolvedBy ?? initial
  const getConvResolutionMsg = (id: string, initial = '') =>
    resolvedOverrides[id]?.message ?? initial

  const openCount     = allCurrentConvs.filter((c) => !isConvResolved(c.id, c.isResolved)).length
  const resolvedCount = allCurrentConvs.filter((c) =>  isConvResolved(c.id, c.isResolved)).length

  const handleResolvedChange = (id: string, resolved: boolean, resolvedBy?: string, message?: string) =>
    setResolvedOverrides((prev) => ({ ...prev, [id]: { resolved, resolvedBy, message } }))

  const handleSend = ({ text, resolution }: SendPayload) => {
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
      // Resolution only — resolve the last conversation
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
    // Remove from sent messages if it's one we sent
    setSentMessages((prev) => ({
      ...prev,
      [selectedId]: (prev[selectedId] ?? []).filter((m) => m.id !== id),
    }))
    // Track deleted static conversation ids
    setDeletedIds((prev) => new Set([...prev, id]))
  }

  // Close thread when switching topics
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
            title="All topics"
            chevron
            prop2ndAction
            prop2ndActionTooltip="Sort by"
            prop1stAction
            prop1stActionTooltip="New topic"
          />
          <div className="flex-1 overflow-y-auto pt-4 pb-3 px-3 flex flex-col gap-0.5">
            {TOPICS.map((topic) => (
              <PersonRow
                key={topic.id}
                name={topic.title}
                type="topic"
                topicStatus={
                  topic.isResolved ? 'resolved' : 'unresolved'
                }
                isPrivate={topic.isPrivate}
                isSelected={selectedId === topic.id}
                onClick={() => setSelectedId(topic.id)}
              />
            ))}
          </div>
        </div>
      }
      rightPanel={
        selectedTopic ? (
          <div className="flex flex-col h-full">
            <ConversationHeader
              name={selectedTopic.title}
              topicMode
              isResolved={selectedTopic.isResolved}
              isPrivate={selectedTopic.isPrivate}
              openCount={openCount}
              resolvedCount={resolvedCount}
            />
            <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col">
              <div className="flex-1 min-h-0" />
              <div className="shrink-0 flex flex-col px-4 py-4 gap-2">
                {currentGroups.map((group) => (
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
                        showCreateTopic={false}
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
                        showCreateTopic={false}
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
