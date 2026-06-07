import { useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { ScreenerSection } from '@/components/ScreenerSection'
import { StarredSection, type StarredItem } from '@/components/ui/StarredSection'
import { SCREENER_ITEMS } from '@/data/screenerData'
import { withPeekProviders } from './_peekProviders'

/** Left-panel sections: the Screener (incoming triage) and the Starred list. */
const meta = {
  title: 'Peek/Sections',
  decorators: [
    withPeekProviders,
    (Story) => <div className="w-[290px]"><Story /></div>,
  ],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

const noop = () => {}

export const Screener = {
  render: () => (
    <ScreenerSection items={SCREENER_ITEMS.slice(0, 4)} onOpen={noop} onLater={noop} onDismiss={noop} />
  ),
}

const STARRED: StarredItem[] = [
  { id: 1, name: 'Daniel Stanton', type: 'DM', isUnread: true },
  { id: 2, name: 'CI/CD pipeline', type: 'topic', topicStatus: 'unresolved', memberCount: 3 },
  { id: 3, name: 'Remote work policy', type: 'topic', topicStatus: 'resolved', memberCount: 5 },
  { id: 4, name: 'Design huddle', type: 'huddle' },
]

export const Starred = {
  render: () => {
    const [selectedId, setSelectedId] = useState<number | null>(2)
    return <StarredSection items={STARRED} selectedId={selectedId} onSelect={setSelectedId} />
  },
}
