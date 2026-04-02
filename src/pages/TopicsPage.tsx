import { useState, useRef, useEffect } from 'react'
import { AppShell } from '@/layouts/AppShell'
import { ContainerHeader } from '@/components/ContainerHeader'
import { ConversationHeader } from '@/components/ConversationHeader'
import { ConversationCard } from '@/components/ConversationCard'
import { DateDivider } from '@/components/ui/DateDivider'
import { ComposeBox } from '@/components/ui/ComposeBox'
import { PersonRow } from '@/components/ui/PersonRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { TOPICS, TOPIC_CONVERSATIONS, type ConversationData } from '@/data/topicData'

export function TopicsPage() {
  const [selectedId, setSelectedId] = useState<string>('3')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Tracks explicit resolve/reopen actions keyed by conversation id
  const [resolvedOverrides, setResolvedOverrides] = useState<Record<string, boolean>>({})

  // Sent messages per topic
  const [sentMessages, setSentMessages] = useState<Record<string, ConversationData[]>>({})
  // Deleted conversation ids (static data)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  const selectedTopic = TOPICS.find((t) => t.id === selectedId) ?? null
  const currentGroups = TOPIC_CONVERSATIONS[selectedId] ?? []
  const currentSent = sentMessages[selectedId] ?? []

  const allCurrentConvs = [
    ...currentGroups.flatMap((g) => g.convs).filter((c) => !deletedIds.has(c.id)),
    ...currentSent,
  ]

  const isConvResolved = (id: string, initial = false) =>
    resolvedOverrides[id] ?? initial

  const openCount     = allCurrentConvs.filter((c) => !isConvResolved(c.id, c.isResolved)).length
  const resolvedCount = allCurrentConvs.filter((c) =>  isConvResolved(c.id, c.isResolved)).length

  const handleResolvedChange = (id: string, resolved: boolean) =>
    setResolvedOverrides((prev) => ({ ...prev, [id]: resolved }))

  const handleSend = (text: string) => {
    const newMsg: ConversationData = {
      id: `sent_${Date.now()}`,
      authorName: 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      body: text,
    }
    setSentMessages((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), newMsg],
    }))
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
              <div className="shrink-0 flex flex-col px-4 py-4 gap-3">
                {currentGroups.map((group) => (
                  <div key={group.dateLabel} className="flex flex-col gap-3">
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
                        replyCount={c.replyCount}
                        hasNewReply={c.hasNewReply}
                        isResolved={isConvResolved(c.id, c.isResolved)}
                        resolvedBy={c.resolvedBy}
                        resolutionMessage={c.resolutionMessage}
                        showCreateTopic={false}
                        onResolvedChange={(resolved) => handleResolvedChange(c.id, resolved)}
                        onDelete={() => handleDelete(c.id)}
                      />
                    ))}
                  </div>
                ))}

                {/* Sent messages */}
                {currentSent.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <DateDivider label="Today" className="sticky top-0 z-10 bg-bg-surface" />
                    {currentSent.map((m) => (
                      <ConversationCard
                        key={m.id}
                        authorName={m.authorName}
                        timestamp={m.timestamp}
                        body={m.body}
                        showCreateTopic={false}
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
    />
  )
}
