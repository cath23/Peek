import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '@/layouts/AppShell'
import { ContainerHeader } from '@/components/ContainerHeader'
import { PersonRow } from '@/components/ui/PersonRow'
import { useTopicView } from '@/components/views/useTopicView'
import { TOPICS, isTopicFullyResolved, topicHasUnread } from '@/data/topicData'
import { useDebug } from '@/lib/debug'

export function TopicsPage() {
  const { id: routeId } = useParams<{ id: string }>()
  const [selectedId, setSelectedId] = useState<string>(routeId ?? '3')
  const { state: debug } = useDebug()
  const showUnreads = debug.unreads.topics

  useEffect(() => {
    if (routeId) setSelectedId(routeId)
  }, [routeId])

  const selectedTopic = TOPICS.find((t) => t.id === selectedId) ?? null

  // When unreads are visible, sort topics with unread ones at the top.
  const orderedTopics = showUnreads
    ? [...TOPICS].sort((a, b) => Number(topicHasUnread(b.id)) - Number(topicHasUnread(a.id)))
    : TOPICS

  const view = useTopicView({
    topicId: selectedTopic?.id ?? null,
    topicTitle: selectedTopic?.title,
    topicResolved: selectedTopic ? isTopicFullyResolved(selectedTopic.id) : false,
    showUnreads,
  })

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
            {orderedTopics.map((topic) => (
              <PersonRow
                key={topic.id}
                name={topic.title}
                type="topic"
                topicStatus={isTopicFullyResolved(topic.id) ? 'resolved' : 'unresolved'}
                isUnread={showUnreads && topicHasUnread(topic.id)}
                isSelected={selectedId === topic.id}
                onClick={() => setSelectedId(topic.id)}
              />
            ))}
          </div>
        </div>
      }
      rightPanel={view.rightPanel}
      threadPanel={view.threadPanel}
    />
  )
}
