import { useState, useRef, useEffect, type ReactNode } from 'react'
import { IconPlus, IconX, IconPencilMinus } from '@tabler/icons-react'
import { ConversationHeader } from '@/components/ConversationHeader'
import { ConversationCard } from '@/components/ConversationCard'
import { ThreadPanel } from '@/components/ThreadPanel'
import { HuddleCard } from '@/components/HuddleCard'
import { DateDivider } from '@/components/ui/DateDivider'
import { ComposeBox, type SendPayload } from '@/components/ui/ComposeBox'
import { EmptyState } from '@/components/ui/EmptyState'
import { TopicTabs, type TopicTab } from '@/components/ui/TopicTabs'
import { IconButton } from '@/components/ui/IconButton'
import { Button } from '@/components/ui/Button'
import { TOPIC_CONVERSATIONS, type ConversationData, type HighlightType, type ReactionData } from '@/data/topicData'
import { DM_CONVERSATIONS } from '@/data/dmData'
import { type Huddle } from '@/data/huddleData'
import { PEOPLE } from '@/data/peopleData'
import { REPLIES, type ReplyData } from '@/data/replyData'
import { useStarred } from '@/lib/starred'
import { useTopicStore } from '@/lib/topicStore'
import { useTopicMutations } from '@/lib/topicMutations'
import { useLastSelection } from '@/lib/lastSelection'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface UseTopicViewArgs {
  topicId: string | null
  topicTitle?: string
  /** Override the default toggleTopic-and-stay behavior (e.g. Desk wants to clear selection on unstar) */
  onToggleStarred?: () => void
  /** When false, suppress non-urgent hasNewMessage/hasNewReply flags. Urgent flags always show. */
  showUnreads?: boolean
}

interface ViewSlots {
  rightPanel: ReactNode
  threadPanel: ReactNode | undefined
}

export function useTopicView({
  topicId,
  topicTitle,
  onToggleStarred,
  showUnreads = false,
}: UseTopicViewArgs): ViewSlots {
  const [activeTab, setActiveTab] = useState<TopicTab>('conversations')
  const scrollRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { setPendingDmThreadId } = useLastSelection()
  const { isTopicStarred, toggleTopic } = useStarred()
  const { getHuddlesForTopic, findTopic } = useTopicStore()
  const topic = topicId != null ? findTopic(topicId) : undefined

  // Mutation state lives at the app level so a topic's runtime data (sent
  // messages, replies, resolutions, etc.) survives navigating away and back.
  const {
    sentMessages,
    setSentMessages,
    deletedIds,
    setDeletedIds,
    resolvedOverrides,
    setResolvedOverrides,
    sentReplies,
    setSentReplies,
    bodyOverrides,
    setBodyOverrides,
    highlightOverrides,
    setHighlightOverrides,
    createdHuddles,
    setCreatedHuddles,
    deletedHuddleIds,
    setDeletedHuddleIds,
    huddleBodyOverrides,
    setHuddleBodyOverrides,
    reactionOverrides,
    setReactionOverrides,
    isTopicResolved,
  } = useTopicMutations()

  // Derived: a topic is "resolved" iff every non-deleted conv in it is resolved.
  // Single source of truth for the dashed-circle vs checkmark icon everywhere.
  const topicResolved = topicId != null ? isTopicResolved(topicId) : false

  const handleReactionsChange = (id: string, next: ReactionData[]) =>
    setReactionOverrides((prev) => ({ ...prev, [id]: next }))

  // Thread + huddle UI state stays local — it's transient view state, not data.
  const [threadConvId, setThreadConvId] = useState<string | null>(null)
  const huddleCreateRef = useRef<HTMLDivElement>(null)
  const [selectedHuddleId, setSelectedHuddleId] = useState<string | null>(null)
  const [isCreatingHuddle, setIsCreatingHuddle] = useState(false)
  const [huddleRecipients, setHuddleRecipients] = useState<string[]>([])
  const [huddleToQuery, setHuddleToQuery] = useState('')
  const [huddleToFocused, setHuddleToFocused] = useState(false)

  const currentGroups = topicId != null ? (TOPIC_CONVERSATIONS[topicId] ?? []) : []
  const currentSent = topicId != null ? (sentMessages[topicId] ?? []) : []
  const currentHuddles = topicId != null
    ? [...getHuddlesForTopic(topicId), ...(createdHuddles[topicId] ?? [])]
        .filter((h) => !deletedHuddleIds.has(h.id))
        .map((h) => {
          const override = huddleBodyOverrides[h.conversation.id]
          if (override) return { ...h, conversation: { ...h.conversation, body: override } }
          return h
        })
    : []

  /** When the topic was promoted from a DM, this is the seed huddle. Drives the DM-origin empty state. */
  const originHuddle = currentHuddles.find((h) => h.originDmId !== undefined)
  const hasAnyPublicMessages =
    currentGroups.some((g) => g.convs.some((c) => !deletedIds.has(c.id))) || currentSent.length > 0

  const allCurrentConvs = [
    ...currentGroups.flatMap((g) => g.convs).filter((c) => !deletedIds.has(c.id)),
    ...currentSent,
  ]
  const allHuddleConvs = currentHuddles.map((h) => h.conversation)

  /** When the open thread is a promoted huddle's seed message, find that huddle so we can
   *  source the seed message from DM_CONVERSATIONS and render the promotion divider + button. */
  const promotedHuddleForThread = threadConvId
    ? currentHuddles.find((h) => h.seedMessageId === threadConvId && h.originDmId !== undefined)
    : undefined

  /** Look up the seed message from DM_CONVERSATIONS when threadConvId points there. */
  const dmSeedConv: ConversationData | undefined = (() => {
    if (!promotedHuddleForThread || promotedHuddleForThread.originDmId === undefined) return undefined
    const groups = DM_CONVERSATIONS[promotedHuddleForThread.originDmId]
    if (!groups) return undefined
    for (const g of groups) {
      const found = g.convs.find((c) => c.id === threadConvId)
      if (found) return found
    }
    return undefined
  })()

  const threadConvRaw = threadConvId
    ? allCurrentConvs.find((c) => c.id === threadConvId)
      ?? allHuddleConvs.find((c) => c.id === threadConvId)
      ?? dmSeedConv
    : null
  const threadConv = threadConvRaw
    ? {
        ...threadConvRaw,
        ...(threadConvRaw.id in bodyOverrides ? { body: bodyOverrides[threadConvRaw.id] } : {}),
        ...(threadConvRaw.id in highlightOverrides ? { highlightType: highlightOverrides[threadConvRaw.id] } : {}),
      }
    : null
  const rawThreadReplies = threadConvId ? (REPLIES[threadConvId] ?? []) : []
  const threadReplies = rawThreadReplies.map((r) => ({
    ...r,
    isNew: r.isNew && (r.isUrgent || showUnreads),
  }))
  const threadSentReplies = threadConvId ? (sentReplies[threadConvId] ?? []) : []

  const openThread = (convId: string) => setThreadConvId(convId)
  const closeThread = () => {
    setThreadConvId(null)
    setSelectedHuddleId(null)
  }

  const isConvResolved = (id: string, initial = false) => resolvedOverrides[id]?.resolved ?? initial
  const getConvResolvedBy = (id: string, initial = '') => resolvedOverrides[id]?.resolvedBy ?? initial
  const getConvResolutionMsg = (id: string, initial = '') => resolvedOverrides[id]?.message ?? initial

  const openCount     = allCurrentConvs.filter((c) => !isConvResolved(c.id, c.isResolved)).length
  const resolvedCount = allCurrentConvs.filter((c) =>  isConvResolved(c.id, c.isResolved)).length

  // Topic members = invitees (added when topic was created) ∪ authors who have posted (top-level + replies).
  const replyAuthors = allCurrentConvs.flatMap((c) => (REPLIES[c.id] ?? []).map((r) => r.authorName))
  const topicMembers = Array.from(new Set([
    ...(topic?.invitees ?? []),
    ...allCurrentConvs.map((c) => c.authorName),
    ...replyAuthors,
  ]))

  const handleResolvedChange = (id: string, resolved: boolean, resolvedBy?: string, message?: string) =>
    setResolvedOverrides((prev) => ({ ...prev, [id]: { resolved, resolvedBy, message } }))
  const handleHighlightChange = (id: string, hl: HighlightType | undefined) =>
    setHighlightOverrides((prev) => ({ ...prev, [id]: hl }))
  const handleBodyChange = (id: string, body: string) =>
    setBodyOverrides((prev) => ({ ...prev, [id]: body }))

  const handleSendReply = ({ text, resolution, highlightType }: SendPayload) => {
    if (!threadConvId) return
    let newReplyId: string | undefined
    if (text) {
      const now = Date.now()
      newReplyId = `reply_${now}`
      const newReply: ReplyData = {
        id: newReplyId,
        authorName: 'You',
        timestamp: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        body: text,
        highlightType,
        createdAtMs: now,
      }
      setSentReplies((prev) => ({ ...prev, [threadConvId]: [...(prev[threadConvId] ?? []), newReply] }))
    }
    if (resolution) {
      // Stamp resolvedByReplyId so editing this reply later can surface the resolution inline.
      setResolvedOverrides((prev) => ({
        ...prev,
        [threadConvId]: { resolved: true, resolvedBy: 'You', message: resolution.message, resolvedByReplyId: newReplyId },
      }))
    }
  }

  const handleDeleteReply = (replyId: string) => {
    if (!threadConvId) return
    setSentReplies((prev) => ({ ...prev, [threadConvId]: (prev[threadConvId] ?? []).filter((r) => r.id !== replyId) }))
  }

  const handleSend = ({ text, resolution, highlightType }: SendPayload) => {
    if (topicId == null) return
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
      setSentMessages((prev) => ({ ...prev, [topicId]: [...(prev[topicId] ?? []), newMsg] }))
    } else if (resolution) {
      setSentMessages((prev) => {
        const msgs = prev[topicId] ?? []
        if (msgs.length === 0) return prev
        const updated = [...msgs]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          isResolved: true,
          resolvedBy: 'You',
          resolutionMessage: resolution.message || undefined,
        }
        return { ...prev, [topicId]: updated }
      })
    }
  }

  const handleDelete = (id: string) => {
    if (topicId == null) return
    setSentMessages((prev) => ({ ...prev, [topicId]: (prev[topicId] ?? []).filter((m) => m.id !== id) }))
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
    if (!text || huddleRecipients.length === 0 || topicId == null) return
    const newHuddle: Huddle = {
      id: `h_new_${Date.now()}`,
      topicId,
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
    setCreatedHuddles((prev) => ({ ...prev, [topicId]: [...(prev[topicId] ?? []), newHuddle] }))
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
    if (!huddleRecipients.includes(name)) setHuddleRecipients((prev) => [...prev, name])
    setHuddleToQuery('')
  }
  const removeRecipient = (name: string) => setHuddleRecipients((prev) => prev.filter((n) => n !== name))

  const toSuggestions = PEOPLE.filter(
    (p) => !huddleRecipients.includes(p.name) && p.name.toLowerCase().includes(huddleToQuery.toLowerCase())
  )

  // Reset state when switching topics
  useEffect(() => {
    setThreadConvId(null)
    setActiveTab('conversations')
    setSelectedHuddleId(null)
    cancelHuddleCreation()
  }, [topicId])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [topicId])
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [currentSent.length])

  if (topicId == null || !topicTitle) {
    return {
      rightPanel: (
        <div className="flex-1 flex items-center justify-center h-full">
          <EmptyState />
        </div>
      ),
      threadPanel: undefined,
    }
  }

  const rightPanel = (
    <div className="flex flex-col h-full">
      <ConversationHeader
        name={topicTitle}
        topicMode
        isResolved={topicResolved}
        openCount={openCount}
        resolvedCount={resolvedCount}
        members={topicMembers}
        hideTopicMeta={activeTab === 'huddles'}
        isStarred={topicId != null && isTopicStarred(topicId)}
        onToggleStarred={
          onToggleStarred ??
          (topicId != null && topicTitle
            ? () => toggleTopic({
                topicId,
                title: topicTitle,
                topicStatus: topicResolved ? 'resolved' : 'unresolved',
              })
            : undefined)
        }
        tabs={
          <TopicTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab)
              setThreadConvId(null)
              setSelectedHuddleId(null)
              cancelHuddleCreation()
            }}
          />
        }
      />

      {/* Conversations tab */}
      {activeTab === 'conversations' && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1 min-h-0" />
            <div className="shrink-0 flex flex-col px-4 py-4 gap-2">
              {currentGroups.map((group) => (
                <div key={group.dateLabel} className="flex flex-col gap-2">
                  <DateDivider label={group.dateLabel} className="sticky top-0 z-10 bg-bg-surface" />
                  {group.convs.filter((c) => !deletedIds.has(c.id)).map((c) => (
                    <ConversationCard
                      key={`${topicId}_${c.id}`}
                      authorName={c.authorName}
                      timestamp={c.timestamp}
                      body={bodyOverrides[c.id] ?? c.body}
                      reactions={reactionOverrides[c.id] ?? c.reactions}
                      highlightType={c.id in highlightOverrides ? highlightOverrides[c.id] : c.highlightType}
                      replyCount={(REPLIES[c.id]?.length ?? c.replyCount ?? 0) + (sentReplies[c.id]?.length ?? 0)}
                      hasNewMessage={c.hasNewMessage && (c.isUrgent || showUnreads)}
                      hasNewReply={c.hasNewReply && (c.isUrgent || showUnreads)}
                      isResolved={isConvResolved(c.id, c.isResolved)}
                      resolvedBy={getConvResolvedBy(c.id, c.resolvedBy)}
                      resolutionMessage={getConvResolutionMsg(c.id, c.resolutionMessage)}
                      showCreateTopic={false}
                      isSelected={threadConvId === c.id}
                      onResolvedChange={(resolved, resolvedBy, message) => handleResolvedChange(c.id, resolved, resolved ? (resolvedBy ?? 'You') : undefined, message)}
                      onReactionsChange={(next) => handleReactionsChange(c.id, next)}
                      onHighlightChange={(hl) => handleHighlightChange(c.id, hl)}
                      onBodyChange={(b) => handleBodyChange(c.id, b)}
                      onClick={() => openThread(c.id)}
                      onReply={() => openThread(c.id)}
                      onDelete={() => handleDelete(c.id)}
                    />
                  ))}
                </div>
              ))}

              {currentSent.length > 0 && (
                <div className="flex flex-col gap-2">
                  <DateDivider label="Today" className="sticky top-0 z-10 bg-bg-surface" />
                  {currentSent.map((m) => (
                    <ConversationCard
                      key={m.id}
                      authorName={m.authorName}
                      timestamp={m.timestamp}
                      body={bodyOverrides[m.id] ?? m.body}
                      reactions={reactionOverrides[m.id] ?? m.reactions}
                      highlightType={m.id in highlightOverrides ? highlightOverrides[m.id] : m.highlightType}
                      replyCount={sentReplies[m.id]?.length ?? 0}
                      isResolved={isConvResolved(m.id, m.isResolved)}
                      resolvedBy={getConvResolvedBy(m.id, m.resolvedBy)}
                      resolutionMessage={getConvResolutionMsg(m.id, m.resolutionMessage)}
                      showCreateTopic={false}
                      isSelected={threadConvId === m.id}
                      onResolvedChange={(resolved, resolvedBy, message) => handleResolvedChange(m.id, resolved, resolved ? (resolvedBy ?? 'You') : undefined, message)}
                      onReactionsChange={(next) => handleReactionsChange(m.id, next)}
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
          {originHuddle && !hasAnyPublicMessages && originHuddle.originDmId != null && (
            <div className="px-3 pt-2">
              <div className="bg-accent-muted rounded-lg p-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="bg-accent-primary rounded-md size-6 flex items-center justify-center shrink-0">
                    <IconPencilMinus size={16} stroke={1.5} className="text-accent-muted" />
                  </div>
                  <span className="text-[14px] leading-[1.4] text-text-primary truncate">
                    This is the beginning of your conversations in{' '}
                    <span className="font-medium">{topicTitle}</span>
                  </span>
                </div>
                <Button variant="muted" size="small" className="shrink-0" onClick={() => {/* TODO: invite-members dialog */}}>
                  Invite members
                </Button>
              </div>
            </div>
          )}
          <div className="p-3">
            <ComposeBox onSend={handleSend} />
          </div>
        </>
      )}

      {/* Timeline tab */}
      {activeTab === 'timeline' && (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState message="A selective view of how this topic evolved - highlights, resolutions, and key events." />
        </div>
      )}

      {/* Huddles tab */}
      {activeTab === 'huddles' && (
        <>
          {currentHuddles.length === 0 && !isCreatingHuddle ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <EmptyState message="No huddles yet - start a private discussion with a few people or AI." />
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
                {currentHuddles.map((huddle) => {
                  // Promoted-from-DM huddles route the thread to the original DM
                  // message id so replies/reactions/highlights mirror across both
                  // entry points (DM thread panel and huddle thread panel).
                  const threadId = huddle.seedMessageId ?? huddle.conversation.id
                  const openHuddle = () => {
                    setSelectedHuddleId(huddle.id)
                    setThreadConvId(threadId)
                    cancelHuddleCreation()
                  }
                  return (
                    <HuddleCard
                      key={huddle.id}
                      huddle={huddle}
                      isSelected={selectedHuddleId === huddle.id}
                      onClick={openHuddle}
                      onReply={openHuddle}
                      onDelete={() => handleDeleteHuddle(huddle.id)}
                    />
                  )
                })}
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
                    <IconPlus size={16} stroke={1.5} />
                  </IconButton>
                  <span className="text-caption text-text-primary">New Huddle</span>
                </div>
              </div>
            </div>
          )}
          {isCreatingHuddle && (
            <div ref={huddleCreateRef} className="shrink-0 px-3 pb-3 flex flex-col gap-0">
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
                          <IconX size={12} stroke={1.5} />
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
  )

  const threadPanel = threadConv ? (
    <ThreadPanel
      conversation={threadConv}
      replies={threadReplies}
      sentReplies={threadSentReplies}
      isResolved={isConvResolved(threadConv.id, threadConv.isResolved)}
      huddleMembers={
        selectedHuddleId
          ? currentHuddles.find((h) => h.id === selectedHuddleId)?.members ?? []
          : []
      }
      huddleMemberCount={
        selectedHuddleId
          ? currentHuddles.find((h) => h.id === selectedHuddleId)?.members.length
          : undefined
      }
      replyBodyOverrides={bodyOverrides}
      replyHighlightOverrides={highlightOverrides}
      replyReactionOverrides={reactionOverrides}
      initialReactions={threadConvId ? reactionOverrides[threadConvId] ?? threadConv.reactions : threadConv.reactions}
      onInitialReactionsChange={
        threadConvId
          ? (next) => setReactionOverrides((prev) => ({ ...prev, [threadConvId]: next }))
          : undefined
      }
      initialHighlightType={threadConv.highlightType}
      onInitialHighlightChange={
        threadConvId
          ? (hl) => setHighlightOverrides((prev) => ({ ...prev, [threadConvId]: hl }))
          : undefined
      }
      resolvedByReplyId={threadConvId ? resolvedOverrides[threadConvId]?.resolvedByReplyId : undefined}
      resolutionMsg={threadConvId ? resolvedOverrides[threadConvId]?.message : undefined}
      onResolutionChange={
        threadConvId
          ? (resolved, message) => setResolvedOverrides((prev) => {
              const existing = prev[threadConvId]
              if (resolved) {
                return { ...prev, [threadConvId]: { resolved: true, resolvedBy: 'You', message, resolvedByReplyId: existing?.resolvedByReplyId } }
              }
              // Reopen — clear everything including the reply pointer.
              return { ...prev, [threadConvId]: { resolved: false } }
            })
          : undefined
      }
      promotionDivider={
        promotedHuddleForThread && topic
          ? {
              topicId: topic.id,
              topicTitle: topic.title,
              topicResolved,
              dateLabel: promotedHuddleForThread.promotedAt ?? '',
              promotedAtMs: promotedHuddleForThread.promotedAtMs,
              // We're already on this topic page; clicking the link should switch to
              // the Conversations tab and close the thread panel rather than re-issue
              // a no-op navigation that wouldn't reset local tab state.
              onTopicClick: () => {
                setActiveTab('conversations')
                closeThread()
              },
            }
          : undefined
      }
      onOpenInDm={
        promotedHuddleForThread && promotedHuddleForThread.originDmId !== undefined && threadConvId
          ? () => {
              const dmId = promotedHuddleForThread.originDmId
              // Stage the pending thread id BEFORE navigating so the DM view can consume
              // it on mount. Context state is more reliable than location.state across
              // route transitions (location.state can be reset by replace navigations).
              setPendingDmThreadId(threadConvId)
              navigate(`/people/${dmId}`)
            }
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
      onReplyBodyChange={(replyId, body) => setBodyOverrides((prev) => ({ ...prev, [replyId]: body }))}
      onReplyHighlightChange={(replyId, hl) => setHighlightOverrides((prev) => ({ ...prev, [replyId]: hl }))}
      onReplyReactionsChange={(replyId, next) => setReactionOverrides((prev) => ({ ...prev, [replyId]: next }))}
    />
  ) : undefined

  return { rightPanel, threadPanel }
}
