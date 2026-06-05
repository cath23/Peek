import { IconLock } from '@tabler/icons-react'
import { Tabs, type TabDef } from '@nostr-for-business/ui'

export type TopicTab = 'conversations' | 'timeline' | 'huddles'

const DEFAULT_TABS: TabDef<TopicTab>[] = [
  { id: 'conversations', label: 'Conversations' },
  { id: 'huddles', label: 'Huddles', icon: <IconLock size={16} stroke={1.5} /> },
  { id: 'timeline', label: 'Timeline' },
]

interface TopicTabsProps {
  activeTab: TopicTab
  onTabChange: (tab: TopicTab) => void
  tabs?: TabDef<TopicTab>[]
  className?: string
}

/** Peek's tab group — supplies the conversations/huddles/timeline tabs to the shared Tabs. */
export function TopicTabs({
  activeTab,
  onTabChange,
  tabs = DEFAULT_TABS,
  className,
}: TopicTabsProps) {
  return <Tabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} className={className} />
}
