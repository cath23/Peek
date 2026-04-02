import { useState, useRef, useEffect } from 'react'
import { AppShell } from '@/layouts/AppShell'
import { ContainerHeader } from '@/components/ContainerHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { PersonRow } from '@/components/ui/PersonRow'
import { Divider } from '@/components/ui/Divider'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StarredSection } from '@/components/ui/StarredSection'
import { ComposeBox } from '@/components/ui/ComposeBox'
import { ConversationHeader } from '@/components/ConversationHeader'
import { ConversationCard } from '@/components/ConversationCard'
import { DateDivider } from '@/components/ui/DateDivider'
import { DM_CONVERSATIONS } from '@/data/dmData'
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

  const selectedItem = selectedId ? ALL_ITEMS.find((i) => i.id === selectedId) : null
  const isDm = selectedId != null && DM_IDS.has(selectedId)
  const dmGroups = selectedId != null ? (DM_CONVERSATIONS[selectedId] ?? []) : []
  const currentSent = selectedId != null ? (sentMessages[selectedId] ?? []) : []

  const handleSend = (text: string) => {
    if (selectedId == null) return
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
    if (selectedId == null) return
    setSentMessages((prev) => ({
      ...prev,
      [selectedId]: (prev[selectedId] ?? []).filter((m) => m.id !== id),
    }))
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
                <div className="shrink-0 flex flex-col px-4 py-4 gap-3">
                  {dmGroups.map((group) => (
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
                          isResolved={c.isResolved}
                          resolvedBy={c.resolvedBy}
                          resolutionMessage={c.resolutionMessage}
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
    />
  )
}
