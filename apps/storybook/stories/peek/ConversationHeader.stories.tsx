import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConversationHeader } from '@/components/ConversationHeader'
import { withPeekProviders } from './_peekProviders'

/** The header bar above a conversation/topic/huddle main view. */
const meta = {
  title: 'Peek/ConversationHeader',
  component: ConversationHeader,
  decorators: [
    withPeekProviders,
    (Story) => (
      <div className="w-[720px] bg-bg-surface rounded-2xl overflow-hidden"><Story /></div>
    ),
  ],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ConversationHeader>

export default meta
type Story = StoryObj<typeof meta>

export const DM: Story = {
  args: { name: 'Daniel Stanton' },
}

export const Topic: Story = {
  args: {
    topicMode: true,
    name: 'CI/CD pipeline stuck during build stage',
    openCount: 2,
    resolvedCount: 3,
    members: ['You', 'Daniel Stanton', 'Juan Foley'],
    isStarred: true,
  },
}

export const ResolvedTopic: Story = {
  args: {
    topicMode: true,
    name: 'Remote work policy clarifications',
    isResolved: true,
    openCount: 0,
    resolvedCount: 4,
    members: ['You', 'Hallie Pratt', 'Greg Bothman'],
  },
}

export const Huddle: Story = {
  args: {
    huddleMode: true,
    name: 'You, Daniel Stanton, Juan Foley',
    members: ['You', 'Daniel Stanton', 'Juan Foley'],
  },
}
