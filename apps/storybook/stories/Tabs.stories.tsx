import { useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { Tabs, type TabDef } from '@nostr-for-business/ui'
import { IconLock } from '@tabler/icons-react'

const meta = {
  title: 'Primitives/Tabs',
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>

export default meta

const TABS: TabDef[] = [
  { id: 'conversations', label: 'Conversations' },
  { id: 'huddles', label: 'Huddles', icon: <IconLock size={16} stroke={1.5} /> },
  { id: 'timeline', label: 'Timeline' },
]

export const Default = {
  render: () => {
    const [active, setActive] = useState('conversations')
    return <Tabs activeTab={active} onTabChange={setActive} tabs={TABS} />
  },
}
