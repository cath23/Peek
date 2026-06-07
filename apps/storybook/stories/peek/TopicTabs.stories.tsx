import { useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { TopicTabs, type TopicTab } from '@/components/ui/TopicTabs'

/** Peek's topic tab set (Conversations / Huddles / Timeline) over the shared Tabs primitive. */
const meta = {
  title: 'Peek/TopicTabs',
  component: TopicTabs,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TopicTabs>

export default meta

export const Default = {
  render: () => {
    const [active, setActive] = useState<TopicTab>('conversations')
    return <TopicTabs activeTab={active} onTabChange={setActive} />
  },
}
