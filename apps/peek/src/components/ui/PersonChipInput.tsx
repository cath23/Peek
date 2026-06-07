import { Avatar } from './Avatar'
import { ChipInput } from '@nostr-for-business/ui'
import { PEOPLE, type Person } from '@/data/peopleData'

interface PersonChipInputProps {
  value: Person[]
  onChange: (next: Person[]) => void
  placeholder?: string
  autoFocus?: boolean
  /** Person ids excluded from the suggestion list (e.g., the current user). */
  excludeIds?: string[]
}

/** Peek's people picker — supplies PEOPLE + avatar/role rendering to the generic ChipInput. */
export function PersonChipInput({
  value,
  onChange,
  placeholder = 'Search people...',
  autoFocus,
  excludeIds = [],
}: PersonChipInputProps) {
  return (
    <ChipInput<Person>
      value={value}
      onChange={onChange}
      suggestions={PEOPLE}
      excludeKeys={excludeIds}
      getKey={(p) => p.id}
      filterFn={(p, q) => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      renderChip={(p) => (
        <>
          <Avatar size={16} name={p.name} alt={p.name} className="rounded-full" />
          <span className="text-[12px] leading-[1.2] font-medium text-text-primary">{p.name}</span>
        </>
      )}
      renderOption={(p) => (
        <>
          <Avatar size={32} name={p.name} alt={p.name} />
          <div className="flex flex-col flex-1 min-w-0 gap-[2px] justify-center">
            <div className="text-[14px] font-normal leading-[1.4] text-text-primary truncate">{p.name}</div>
            <div className="text-[12px] leading-[1.2] text-text-secondary truncate">{p.role}</div>
          </div>
        </>
      )}
    />
  )
}
