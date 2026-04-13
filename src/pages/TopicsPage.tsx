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
import { TopicTabs, type TopicTab } from '@/components/ui/TopicTabs'
import { TOPICS, TOPIC_CONVERSATIONS, type ConversationData, type HighlightType } from '@/data/topicData'
import { TOPIC_HUDDLES, type Huddle } from '@/data/huddleData'
import { PEOPLE } from '@/data/peopleData'
import { HuddleCard } from '@/components/HuddleCard'
import { IconButton } from '@/components/ui/IconButton'
import { IconPlus, IconX } from '@tabler/icons-react'
import { REPLIES, type ReplyData } from '@/data/replyData'
import { cn } from '@/lib/utils'

export function TopicsPage() {
  const [selectedId, setSelectedId] = useState<string>('3')
  const [activeTab, setActiveTab] = useState<TopicTab>('conversations')
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

  // Huddle state
  const huddleCreateRef = useRef<HTMLDivElement>(null)
  const [selectedHuddleId, setSelectedHuddleId] = useState<string | null>(null)
  const [isCreatingHuddle, setIsCreatingHuddle] = useState(false)
  const [huddleRecipients, setHuddleRecipients] = useState<string[]>([])
  const [huddleToQuery, setHuddleToQuery] = useState('')
  const [huddleToFocused, setHuddleToFocused] = useState(false)
  const [createdHuddles, setCreatedHuddles] = useState<Record<string, Huddle[]>>({})
  const [deletedHuddleIds, setDeletedHuddleIds] = useState<Set<string>>(new Set())
  // Tracks edited huddle conversation bodies keyed by conversation id
  const [huddleBodyOverrides, setHuddleBodyOverrides] = useState<Record<string, string>>({})
  // Tracks highlight and body overrides for conversations (from card-level edits)
  const [highlightOverrides, setHighlightOverrides] = useState<Record<string, HighlightType | undefined>>({})
  const [bodyOverrides, setBodyOverrides] = useState<Record<string, string>>({})

  const selectedTopic = TOPICS.find((t) => t.id === selectedId) ?? null
  const currentGroups = TOPIC_CONVERSATIONS[selectedId] ?? []
  const currentSent = sentMessages[selectedId] ?? []
  const currentHuddles = [
    ...(TOPIC_HUDDLES[selectedId] ?? []),
    ...(createdHuddles[selectedId] ?? []),
  ]
    .filter((h) => !deletedHuddleIds.has(h.id))
    .map((h) => {
      const override = huddleBodyOverrides[h.conversation.id]
      if (override) return { ...h, conversation: { ...h.conversation, body: override } }
      return h
    })

  const allCurrentConvs = [
    ...currentGroups.flatMap((g) => g.convs).filter((c) => !deletedIds.has(c.id)),
    ...currentSent,
  ]

  // All huddle conversations (for thread panel lookup)
  const allHuddleConvs = currentHuddles.map((h) => h.conversation)

  // Thread helpers — look in both topic convs and huddle convs
  const threadConvRaw = threadConvId
    ? allCurrentConvs.find((c) => c.id === threadConvId) ?? allHuddleConvs.find((c) => c.id === threadConvId)
    : null
  // Apply highlight/body overrides so the pinned message stays in sync
  const threadConv = threadConvRaw
    ? {
        ...threadConvRaw,
        ...(threadConvRaw.id in bodyOverrides ? { body: bodyOverrides[threadConvRaw.id] } : {}),
        ...(threadConvRaw.id in highlightOverrides ? { highlightType: highlightOverrides[threadConvRaw.id] } : {}),
      }
    : null
  const threadReplies = threadConvId ? (REPLIES[threadConvId] ?? []) : []
  const threadSentReplies = threadConvId ? (sentReplies[threadConvId] ?? []) : []

  const openThread = (convId: string) => setThreadConvId(convId)
  const closeThread = () => {
    setThreadConvId(null)
    setSelectedHuddleId(null)
  }

  const handleSendReply = ({ text, resolution, highlightType }: SendPayload) => {
    if (!threadConvId) return
    if (text) {
      const newReply: ReplyData = {
        id: `reply_${Date.now()}`,
        authorName: 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        body: text,
        highlightType,
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

  const handleHighlightChange = (id: string, hl: HighlightType | undefined) =>
    setHighlightOverrides((prev) => ({ ...prev, [id]: hl }))

  const handleBodyChange = (id: string, body: string) =>
    setBodyOverrides((prev) => ({ ...prev, [id]: body }))

  const handleSend = ({ text, resolution, highlightType }: SendPayload) => {
    if (text) {
      const newMsg: ConversationData = {
        id: `sent_${Date.now()}`,
        authorName: 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        body: text,
        highlightType,
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

  const cancelHuddleCreation = () => {
    setIsCreatingHuddle(false)
    setHuddleRecipients([])
    setHuddleToQuery('')
  }

  // Close huddle creation on outside click or Escape
  useEffect(() => {
    if (!isCreatingHuddle) return
    const handleClick = (e: MouseEvent) => {
      if (huddleCreateRef.current?.contains(e.target as Node)) return
      cancelHuddleCreation()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelHuddleCreation()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isCreatingHuddle])

  const handleHuddleSend = ({ text }: SendPayload) => {
    if (!text || huddleRecipients.length === 0) return
    const newHuddle: Huddle = {
      id: `h_new_${Date.now()}`,
      topicId: selectedId,
      members: ['You', ...huddleRecipients],
      state: 'active',
      lastActivity: 'Today',
      conversation: {
        id: `hc_new_${Date.now()}`,
        authorName: 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        body: text,
      },
    }
    setCreatedHuddles((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), newHuddle],
    }))
    cancelHuddleCreation()
  }

  const handleDeleteHuddle = (huddleId: string) => {
    setDeletedHuddleIds((prev) => new Set([...prev, huddleId]))
    if (selectedHuddleId === huddleId) {
      setSelectedHuddleId(null)
      setThreadConvId(null)
    }
  }

  const addRecipient = (name: string) => {
    if (!huddleRecipients.includes(name)) {
      setHuddleRecipients((prev) => [...prev, name])
    }
    setHuddleToQuery('')
  }

  const removeRecipient = (name: string) => {
    setHuddleRecipients((prev) => prev.filter((n) => n !== name))
  }

  // People suggestions for To: field
  const toSuggestions = PEOPLE.filter(
    (p) => !huddleRecipients.includes(p.name) && p.name.toLowerCase().includes(huddleToQuery.toLowerCase())
  )

  // Reset state when switching topics
  useEffect(() => {
    setThreadConvId(null)
    setActiveTab('conversations')
    setSelectedHuddleId(null)
    cancelHuddleCreation()
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
              openCount={openCount}
              resolvedCount={resolvedCount}
              hideTopicMeta={activeTab === 'huddles'}
              tabs={<TopicTabs activeTab={activeTab} onTabChange={(tab) => {
                setActiveTab(tab)
                setThreadConvId(null)
                setSelectedHuddleId(null)
                cancelHuddleCreation()
              }} />}
            />

            {/* ── Conversations tab ── */}
            {activeTab === 'conversations' && (
              <>
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
                            body={bodyOverrides[c.id] ?? c.body}
                            reactions={c.reactions}
                            highlightType={c.id in highlightOverrides ? highlightOverrides[c.id] : c.highlightType}
                            replyCount={(c.replyCount ?? 0) + (sentReplies[c.id]?.length ?? 0)}
                            hasNewReply={c.hasNewReply}
                            isResolved={isConvResolved(c.id, c.isResolved)}
                            resolvedBy={getConvResolvedBy(c.id, c.resolvedBy)}
                            resolutionMessage={getConvResolutionMsg(c.id, c.resolutionMessage)}
                            showCreateTopic={false}
                            isSelected={threadConvId === c.id}
                            onResolvedChange={(resolved) => handleResolvedChange(c.id, resolved, resolved ? 'You' : undefined)}
                            onHighlightChange={(hl) => handleHighlightChange(c.id, hl)}
                            onBodyChange={(b) => handleBodyChange(c.id, b)}
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
                            body={bodyOverrides[m.id] ?? m.body}
                            highlightType={m.id in highlightOverrides ? highlightOverrides[m.id] : m.highlightType}
                            isResolved={isConvResolved(m.id, m.isResolved)}
                            resolvedBy={getConvResolvedBy(m.id, m.resolvedBy)}
                            resolutionMessage={getConvResolutionMsg(m.id, m.resolutionMessage)}
                            showCreateTopic={false}
                            isSelected={threadConvId === m.id}
                            onResolvedChange={(resolved) => handleResolvedChange(m.id, resolved, resolved ? 'You' : undefined)}
                            onHighlightChange={(hl) => handleHighlightChange(m.id, hl)}
                            onBodyChange={(b) => handleBodyChange(m.id, b)}
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
              </>
            )}

            {/* ── Timeline tab ── */}
            {activeTab === 'timeline' && (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState message="A selective view of how this topic evolved — highlights, resolutions, and key events." />
              </div>
            )}

            {/* ── Huddles tab ── */}
            {activeTab === 'huddles' && (
              <>
                {currentHuddles.length === 0 && !isCreatingHuddle ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <EmptyState message="No huddles yet — start a private discussion with a few people or AI." />
                    <button
                      onClick={() => setIsCreatingHuddle(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-elevated border border-border-default text-caption text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer"
                    >
                      <IconPlus size={14} stroke={1.5} />
                      New Huddle
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="grid grid-cols-2 gap-3">
                      {currentHuddles.map((huddle) => (
                        <HuddleCard
                          key={huddle.id}
                          huddle={huddle}
                          isSelected={selectedHuddleId === huddle.id}
                          onClick={() => {
                            setSelectedHuddleId(huddle.id)
                            setThreadConvId(huddle.conversation.id)
                            cancelHuddleCreation()
                          }}
                          onReply={() => {
                            setSelectedHuddleId(huddle.id)
                            setThreadConvId(huddle.conversation.id)
                            cancelHuddleCreation()
                          }}
                          onDelete={() => handleDeleteHuddle(huddle.id)}
                        />
                      ))}
                      {/* New Huddle button — span both cols when alone on its row */}
                      <div className={cn(
                        'flex flex-col items-center justify-center gap-2 h-[130px]',
                        currentHuddles.length % 2 === 0 && 'col-span-2'
                      )}>
                        <IconButton
                          variant="primary"
                          disabled={isCreatingHuddle}
                          onClick={() => setIsCreatingHuddle(true)}
                          aria-label="New Huddle"
                        >
                          <IconPlus size={16} stroke={2} />
                        </IconButton>
                        <span className="text-caption text-text-primary">New Huddle</span>
                      </div>
                    </div>
                  </div>
                )}
                {isCreatingHuddle && (
                  <div ref={huddleCreateRef} className="shrink-0 px-3 pb-3 flex flex-col gap-0">
                    {/* To: field */}
                    <div className="relative">
                      <div className="flex items-center gap-2 px-3 py-2 bg-bg-elevated border border-border-default rounded-t-lg">
                        <span className="text-caption text-text-muted shrink-0">To:</span>
                        <div className="flex-1 flex items-center gap-1 flex-wrap min-h-[24px]">
                          {huddleRecipients.map((name) => (
                            <span
                              key={name}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent-muted text-text-primary text-sm rounded-sm"
                            >
                              {name}
                              <button
                                onClick={() => removeRecipient(name)}
                                className="text-text-muted hover:text-text-primary cursor-pointer"
                              >
                                <IconX size={12} stroke={2} />
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            value={huddleToQuery}
                            onChange={(e) => setHuddleToQuery(e.target.value)}
                            onFocus={() => setHuddleToFocused(true)}
                            onBlur={() => setTimeout(() => setHuddleToFocused(false), 150)}
                            placeholder={huddleRecipients.length === 0 ? 'Add people...' : ''}
                            autoFocus
                            className="flex-1 min-w-[80px] bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                          />
                        </div>
                        <button
                          onClick={cancelHuddleCreation}
                          className="text-caption text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                      {/* People dropdown */}
                      {huddleToFocused && toSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 bottom-full mb-1 bg-bg-elevated border border-border-default rounded-lg shadow-md py-1 max-h-[200px] overflow-y-auto z-50">
                          {toSuggestions.map((person) => (
                            <button
                              key={person.id}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => addRecipient(person.name)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-bg-hover transition-colors cursor-pointer"
                            >
                              <div className="size-6 rounded-sm overflow-hidden shrink-0 bg-accent-muted" />
                              <div className="flex flex-col items-start">
                                <span className="text-sm text-text-primary">{person.name}</span>
                                <span className="text-caption text-text-muted">{person.role}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Compose area */}
                    {huddleRecipients.length === 0 ? (
                      <div className="flex items-center justify-center py-4 px-3 bg-bg-surface border border-t-0 border-border-default rounded-b-lg">
                        <span className="text-caption text-text-muted">Add at least one person to start a Huddle</span>
                      </div>
                    ) : (
                      <div className="border border-t-0 border-border-default rounded-b-lg overflow-hidden">
                        <ComposeBox onSend={handleHuddleSend} placeholder="default" />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
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
            huddleMemberCount={
              selectedHuddleId
                ? currentHuddles.find((h) => h.id === selectedHuddleId)?.members.length
                : undefined
            }
            onClose={closeThread}
            onSendReply={handleSendReply}
            onDeleteReply={handleDeleteReply}
            onInitialBodyChange={
              selectedHuddleId && threadConvId
                ? (newBody: string) => setHuddleBodyOverrides((prev) => ({ ...prev, [threadConvId]: newBody }))
                : undefined
            }
          />
        ) : undefined
      }
    />
  )
}
