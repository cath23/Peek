import { TopicState } from './TopicState'
import { cn } from '@/lib/utils'
import { type Topic } from '@/data/topicData'

interface TopicMenuProps {
  topics: Topic[]
  highlight: number
  onSelect: (topic: Topic) => void
  onHighlightChange: (index: number) => void
}

export function TopicMenu({ topics, highlight, onSelect, onHighlightChange }: TopicMenuProps) {
  if (topics.length === 0) return null

  return (
    <div className="w-fit min-w-[420px] bg-bg-elevated border border-border-default rounded-lg overflow-hidden shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.4),0px_10px_15px_-3px_rgba(0,0,0,0.5)]">
      <div className="p-2">
        {/* Section header */}
        <div className="flex items-center h-8 px-3">
          <span className="text-h5 text-text-secondary">Topics</span>
        </div>

        {/* Rows */}
        {topics.map((topic, i) => (
          <div
            key={topic.id}
            className={cn(
              'flex items-center gap-3 h-10 px-3 py-1.5 rounded-lg cursor-pointer transition-colors',
              i === highlight ? 'bg-bg-hover' : ''
            )}
            onMouseEnter={() => onHighlightChange(i)}
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect(topic)
            }}
          >
            <TopicState
              type="topic"
              status={topic.isResolved ? 'resolved' : 'unresolved'}
              isPrivate={topic.isPrivate}
            />

            <div className="flex-1 min-w-0 text-[14px] font-normal leading-[1.4] text-text-primary truncate">
              {topic.title}
            </div>

            {i === highlight && (
              <div className="flex items-center gap-2 shrink-0 text-text-muted">
                <span className="text-[12px] leading-[1.2]">↩</span>
                <span className="text-[9px] font-medium leading-[1.15]">#topic</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
