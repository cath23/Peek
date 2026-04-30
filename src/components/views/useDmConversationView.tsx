import { useState, useRef, useEffect, type ReactNode } from 'react'
import { ConversationHeader } from '@/components/ConversationHeader'
import { ConversationCard } from '@/components/ConversationCard'
import { ThreadPanel } from '@/components/ThreadPanel'
import { DateDivider } from '@/components/ui/DateDivider'
import { ComposeBox, type SendPayload } from '@/components/ui/ComposeBox'
import { EmptyState } from '@/components/ui/EmptyState'
import { DM_CONVERSATIONS } from '@/data/dmData'
import { REPLIES, type ReplyData } from '@/data/replyData'
import { type ConversationData } from '@/data/topicData'
import { useStarred } from '@/lib/starred'

interface UseDmConversationViewArgs {
  dmId: number | null
  dmName?: string
  /** Override the default toggleDm-and-stay behavior (e.g. Desk wants to clear selection on unstar) */
  onToggleStarred?: () => void
  /** When false, suppress non-urgent hasNewMessage/hasNewReply flags. Urgent flags always show. */
  showUnreads?: boolean
}

interface ViewSlots {
  rightPanel: ReactNode
  threadPanel: ReactNode | undefined
}

export function useDmConversationView({ dmId, dmName, onToggleStarred, showUnreads = false }: UseDmConversationViewArgs): ViewSlots {
  const [sentMessages, setSentMessages] = useState<Record<number, ConversationData[]>>({})
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [resolvedOverrides, setResolvedOverrides] = useState<Record<string, { resolved: boolean; resolvedBy?: string; message?: string }>>({})
  const [threadConvId, setThreadConvId] = useState<string | null>(null)
  const [sentReplies, setSentReplies] = useState<Record<string, ReplyData[]>>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const { isDmStarred, toggleDm } = useStarred()

  const dmGroups = dmId != null ? (DM_CONVERSATIONS[dmId] ?? []) : []
  const currentSent = dmId != null ? (sentMessages[dmId] ?? []) : []

  const allConvs = [...dmGroups.flatMap((g) => g.convs), ...currentSent]
  const threadConv = threadConvId ? allConvs.find((c) => c.id === threadConvId) : null
  const rawThreadReplies = threadConvId ? (REPLIES[threadConvId] ?? []) : []
  const threadReplies = rawThreadReplies.map((r) => ({
    ...r,
    isNew: r.isNew && (r.isUrgent || showUnreads),
  }))
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
    if (dmId == null) return
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
      setSentMessages((prev) => ({ ...prev, [dmId]: [...(prev[dmId] ?? []), newMsg] }))
    } else if (resolution) {
      setSentMessages((prev) => {
        const msgs = prev[dmId] ?? []
        if (msgs.length === 0) return prev
        const updated = [...msgs]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          isResolved: true,
          resolvedBy: 'You',
          resolutionMessage: resolution.message || undefined,
        }
        return { ...prev, [dmId]: updated }
      })
    }
  }

  const handleDelete = (id: string) => {
    if (dmId == null) return
    setSentMessages((prev) => ({ ...prev, [dmId]: (prev[dmId] ?? []).filter((m) => m.id !== id) }))
    setDeletedIds((prev) => new Set([...prev, id]))
  }

  // Close thread when switching DMs
  useEffect(() => {
    setThreadConvId(null)
  }, [dmId])

  // Scroll to bottom on DM switch / new message
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [dmId])
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [currentSent.length])

  if (dmId == null || !dmName) {
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
        name={dmName}
        isStarred={dmId != null && isDmStarred(dmId)}
        onToggleStarred={
          onToggleStarred ??
          (dmId != null && dmName ? () => toggleDm({ dmId, name: dmName }) : undefined)
        }
      />
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1 min-h-0" />
        <div className="shrink-0 flex flex-col px-4 py-4 gap-2">
          {dmGroups.map((group) => (
            <div key={group.dateLabel} className="flex flex-col gap-2">
              <DateDivider label={group.dateLabel} className="sticky top-0 z-10 bg-bg-surface" />
              {group.convs.filter((c) => !deletedIds.has(c.id)).map((c) => (
                <ConversationCard
                  key={`${dmId}_${c.id}`}
                  authorName={c.authorName}
                  timestamp={c.timestamp}
                  body={c.body}
                  reactions={c.reactions}
                  replyCount={(REPLIES[c.id]?.length ?? c.replyCount ?? 0) + (sentReplies[c.id]?.length ?? 0)}
                  hasNewMessage={c.hasNewMessage && (c.isUrgent || showUnreads)}
                  hasNewReply={c.hasNewReply && (c.isUrgent || showUnreads)}
                  isUrgent={c.isUrgent}
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

          {currentSent.length > 0 && (
            <div className="flex flex-col gap-2">
              <DateDivider label="Today" className="sticky top-0 z-10 bg-bg-surface" />
              {currentSent.map((m) => (
                <ConversationCard
                  key={m.id}
                  authorName={m.authorName}
                  timestamp={m.timestamp}
                  body={m.body}
                  replyCount={sentReplies[m.id]?.length ?? 0}
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
  )

  const threadPanel = threadConv ? (
    <ThreadPanel
      conversation={threadConv}
      replies={threadReplies}
      sentReplies={threadSentReplies}
      isResolved={isConvResolved(threadConv.id, threadConv.isResolved)}
      dmMembers={dmName ? ['You', dmName] : []}
      onClose={closeThread}
      onSendReply={handleSendReply}
      onDeleteReply={handleDeleteReply}
    />
  ) : undefined

  return { rightPanel, threadPanel }
}
