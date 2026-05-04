import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/layouts/AppShell'
import { ContainerHeader } from '@/components/ContainerHeader'
import { PersonRow } from '@/components/ui/PersonRow'
import { useTopicView } from '@/components/views/useTopicView'
import { topicHasUnread } from '@/data/topicData'
import { useDebug } from '@/lib/debug'
import { useTopicStore } from '@/lib/topicStore'
import { useTopicMutations } from '@/lib/topicMutations'
import { useLastSelection } from '@/lib/lastSelection'

export function TopicsPage() {
  const navigate = useNavigate()
  const { id: routeId } = useParams<{ id: string }>()
  const { topicId: lastTopicId, setLastTopicId } = useLastSelection()
  const { state: debug } = useDebug()
  const { topics: TOPICS } = useTopicStore()
  const { isTopicResolved } = useTopicMutations()
  const showUnreads = debug.unreads.topics

  // URL is the source of truth. Fallbacks only kick in until the redirect-effect lands.
  const selectedId = routeId ?? lastTopicId ?? '3'

  useEffect(() => {
    if (routeId) {
      setLastTopicId(routeId)
    } else if (lastTopicId) {
      // /topics with no id — restore last selection in URL.
      navigate(`/topics/${lastTopicId}`, { replace: true })
    }
  }, [routeId, lastTopicId, navigate, setLastTopicId])

  const handleSelectTopic = (id: string) => {
    navigate(`/topics/${id}`)
  }

  const selectedTopic = TOPICS.find((t) => t.id === selectedId) ?? null

  // Always alphabetical by title; unread-first overlay when the toggle is on.
  const alphaSorted = [...TOPICS].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
  )
  const orderedTopics = showUnreads
    ? alphaSorted.sort((a, b) => Number(topicHasUnread(b.id)) - Number(topicHasUnread(a.id)))
    : alphaSorted

  const view = useTopicView({
    topicId: selectedTopic?.id ?? null,
    topicTitle: selectedTopic?.title,
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
                topicStatus={isTopicResolved(topic.id) ? 'resolved' : 'unresolved'}
                isUnread={showUnreads && topicHasUnread(topic.id)}
                isSelected={selectedId === topic.id}
                onClick={() => handleSelectTopic(topic.id)}
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
