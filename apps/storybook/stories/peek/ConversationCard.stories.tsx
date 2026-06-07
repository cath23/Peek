import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConversationCard } from '@/components/ConversationCard'
import { withPeekProviders } from './_peekProviders'

/**
 * Peek's primary message card. Rich with state — hover for the quick menu, and the
 * variants below cover urgency, reactions, replies, resolution, and the topic anchor.
 */
const meta = {
  title: 'Peek/ConversationCard',
  component: ConversationCard,
  decorators: [
    withPeekProviders,
    (Story) => <div className="w-[560px]"><Story /></div>,
  ],
  parameters: { layout: 'padded' },
  args: {
    authorName: 'Daniel Stanton',
    timestamp: '9:40 AM',
    body: 'Confirmed it was only @testing-library/react. Pinned to 14.x and the build is green again.',
  },
} satisfies Meta<typeof ConversationCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Urgent: Story = {
  args: { isUrgent: true, hasNewMessage: true, body: '!@You can we get this out before the release cut?' },
}

export const WithReactions: Story = {
  args: {
    reactions: [
      { emoji: '🚀', count: 4, owner: 'others' },
      { emoji: '👍', count: 1, owner: 'yours' },
    ],
  },
}

export const WithReplies: Story = {
  args: { replyCount: 3, hasNewReply: true },
}

export const Highlighted: Story = {
  args: { highlightType: 'conclusion' },
}

export const Resolved: Story = {
  args: {
    isResolved: true,
    resolvedBy: 'Daniel Stanton',
    resolutionMessage: 'Pinned @testing-library/react to 14.x.',
  },
}

export const NewMessage: Story = {
  args: { hasNewMessage: true },
}

export const AsTopic: Story = {
  args: { isTopic: true, topicTitle: 'CI/CD pipeline stuck on build', replyCount: 5 },
}

export const Selected: Story = {
  args: { isSelected: true, replyCount: 2 },
}
