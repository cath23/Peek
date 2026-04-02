import { Avatar } from './Avatar'
import { cn } from '@/lib/utils'
import { type Person } from '@/data/peopleData'

interface MentionMenuProps {
  people: Person[]
  highlight: number
  isUrgent: boolean
  onSelect: (person: Person) => void
  onHighlightChange: (index: number) => void
}

export function MentionMenu({ people, highlight, isUrgent, onSelect, onHighlightChange }: MentionMenuProps) {
  if (people.length === 0) return null

  return (
    <div className="w-fit min-w-[380px] bg-bg-elevated border border-border-default rounded-lg overflow-hidden shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.4),0px_10px_15px_-3px_rgba(0,0,0,0.5)]">
      <div className="p-2">
        {/* Section header */}
        <div className="flex items-center h-8 px-3">
          <span className="text-h5 text-text-secondary">People</span>
        </div>

        {/* Rows */}
        {people.map((person, i) => (
          <div
            key={person.id}
            className={cn(
              'flex items-center gap-3 h-12 px-3 py-1.5 rounded-lg cursor-pointer transition-colors',
              i === highlight ? 'bg-bg-hover' : ''
            )}
            onMouseEnter={() => onHighlightChange(i)}
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect(person)
            }}
          >
            <Avatar size={32} alt={person.name} />

            <div className="flex flex-col flex-1 min-w-0" style={{ gap: '2px' }}>
              <div className="text-[14px] font-normal leading-[1.4] text-text-primary truncate">
                {person.name}
              </div>
              <div className="text-[12px] leading-[1.2] text-text-secondary truncate">
                {person.role}
              </div>
            </div>

            {i === highlight && (
              <div className="flex items-center gap-2 shrink-0 text-text-muted">
                <span className="text-[12px] leading-[1.2]">↩</span>
                <span className="text-[9px] font-medium leading-[1.15]">
                  {isUrgent ? '!@urgent' : '@mention'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
