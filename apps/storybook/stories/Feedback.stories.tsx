import type { Meta } from '@storybook/react-vite'
import { EmptyState } from '@nostr-for-business/ui'
import { IconInbox } from '@tabler/icons-react'

const meta = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>

export default meta

export const Default = {
  render: () => <EmptyState message="No conversation selected" />,
}

export const WithIcon = {
  render: () => <EmptyState icon={<IconInbox size={16} stroke={1.5} />} message="Your inbox is empty" />,
}
