import type { Meta } from '@storybook/react-vite'
import { EmptyState, Divider, DateDivider } from '@nostr-for-business/ui'
import { IconInbox } from '@tabler/icons-react'

const meta = {
  title: 'Primitives/Feedback & Dividers',
} satisfies Meta

export default meta

export const Empty = {
  render: () => <EmptyState message="No conversation selected" />,
}

export const EmptyWithIcon = {
  render: () => <EmptyState icon={<IconInbox size={16} stroke={1.5} />} message="Your inbox is empty" />,
}

export const Dividers = {
  render: () => (
    <div className="w-[320px] flex flex-col gap-4">
      <Divider />
      <DateDivider label="Today" />
      <DateDivider label="Replies" />
    </div>
  ),
}
