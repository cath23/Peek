import { type ReactNode } from 'react'
import { cn } from './lib/cn'

export interface TabDef<T extends string = string> {
  id: T
  label: string
  icon?: ReactNode
}

interface TabsProps<T extends string> {
  activeTab: T
  onTabChange: (tab: T) => void
  tabs: TabDef<T>[]
  className?: string
}

/** Generic tab group. The set of tabs is supplied by the consumer. */
export function Tabs<T extends string>({
  activeTab,
  onTabChange,
  tabs,
  className,
}: TabsProps<T>) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-colors',
            activeTab === tab.id
              ? 'bg-accent-muted text-text-primary'
              : 'text-text-secondary hover:bg-bg-hover'
          )}
          style={{ fontSize: 12, lineHeight: '120%', fontWeight: 400 }}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
