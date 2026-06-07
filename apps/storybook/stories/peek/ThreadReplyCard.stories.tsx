import type { Meta, StoryObj } from '@storybook/react-vite'
import { ThreadReplyCard } from '@/components/ThreadReplyCard'
import { withPeekProviders } from './_peekProviders'

/** A single reply inside the thread panel. Lighter chrome than ConversationCard. */
const meta = {
  title: 'Peek/ThreadReplyCard',
  component: ThreadReplyCard,
  decorators: [
    withPeekProviders,
    (Story) => <div className="w-[360px]"><Story /></div>,
  ],
  parameters: { layout: 'padded' },
  args: {
    authorName: 'Hallie Pratt',
    timestamp: '10:02 AM',
    body: 'Agreed — I pushed the lockfile fix, can you re-run CI?',
  },
} satisfies Meta<typeof ThreadReplyCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const New: Story = {
  args: { isNew: true },
}

export const Urgent: Story = {
  args: { isUrgent: true, isNew: true, body: '!@Daniel the pipeline is red again — blocking the release.' },
}

export const WithReactions: Story = {
  args: {
    reactions: [
      { emoji: '🙏', count: 3, owner: 'others' },
      { emoji: '✅', count: 1, owner: 'yours' },
    ],
  },
}

export const Highlighted: Story = {
  args: { highlightType: 'question' },
}
