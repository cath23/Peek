import { useState, useRef, useEffect } from 'react'
import { AppShell } from '@/layouts/AppShell'
import { ContainerHeader } from '@/components/ContainerHeader'
import { ConversationHeader } from '@/components/ConversationHeader'
import { ConversationCard } from '@/components/ConversationCard'
import { DateDivider } from '@/components/ui/DateDivider'
import { ComposeBox } from '@/components/ui/ComposeBox'
import { PersonRow } from '@/components/ui/PersonRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { TOPIC_CONVERSATIONS } from '@/data/topicData'

interface Topic {
  id: string
  title: string
  isPrivate: boolean
  isResolved: boolean
}

const TOPICS: Topic[] = [
  { id: '1', title: 'CI/CD pipeline stuck during build stage',       isPrivate: false, isResolved: false },
  { id: '2', title: 'Launch checklist for v2 of the mobile app',     isPrivate: true,  isResolved: false },
  { id: '3', title: 'Ongoing onboarding issues',                     isPrivate: false, isResolved: false },
  { id: '4', title: 'Remote work policy clarifications',             isPrivate: true,  isResolved: true  },
  { id: '5', title: 'Usability test results for the dashboard redesign', isPrivate: false, isResolved: true  },
  { id: '6', title: 'Show your pet!',                                isPrivate: false, isResolved: false },
  { id: '7', title: 'Updates on the new office layout',              isPrivate: false, isResolved: false },
  { id: '8', title: 'Quick fix needed for staging deployment issue', isPrivate: false, isResolved: false },
  { id: '9', title: 'Feedback on mobile onboarding flow',            isPrivate: false, isResolved: false },
]

export function TopicsPage() {
  const [selectedId, setSelectedId] = useState<string>('3')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Tracks explicit resolve/reopen actions keyed by conversation id
  const [resolvedOverrides, setResolvedOverrides] = useState<Record<string, boolean>>({})

  const selectedTopic = TOPICS.find((t) => t.id === selectedId) ?? null
  const currentGroups = TOPIC_CONVERSATIONS[selectedId] ?? []
  const allCurrentConvs = currentGroups.flatMap((g) => g.convs)

  const isConvResolved = (id: string, initial = false) =>
    resolvedOverrides[id] ?? initial

  const openCount     = allCurrentConvs.filter((c) => !isConvResolved(c.id, c.isResolved)).length
  const resolvedCount = allCurrentConvs.filter((c) =>  isConvResolved(c.id, c.isResolved)).length
  const allResolved   = allCurrentConvs.length > 0 && openCount === 0

  const handleResolvedChange = (id: string, resolved: boolean) =>
    setResolvedOverrides((prev) => ({ ...prev, [id]: resolved }))

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedId])

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
                  (topic.id === selectedId ? allResolved : topic.isResolved)
                    ? 'resolved'
                    : 'unresolved'
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
              isResolved={allResolved}
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
                    {group.convs.map((c) => (
                      <ConversationCard
                        key={`${selectedId}_${c.id}`}
                        authorName={c.authorName}
                        timestamp={c.timestamp}
                        body={c.body}
                        replyCount={c.replyCount}
                        hasNewReply={c.hasNewReply}
                        isResolved={isConvResolved(c.id, c.isResolved)}
                        resolvedBy={c.resolvedBy}
                        resolutionMessage={c.resolutionMessage}
                        showCreateTopic={false}
                        onResolvedChange={(resolved) => handleResolvedChange(c.id, resolved)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3">
              <ComposeBox />
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
