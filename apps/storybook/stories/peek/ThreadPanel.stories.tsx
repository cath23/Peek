import type { Meta } from '@storybook/react-vite'
import { ThreadPanel } from '@/components/ThreadPanel'
import { TOPIC_HUDDLES } from '@/data/huddleData'
import { REPLIES } from '@/data/replyData'
import { withPeekProviders } from './_peekProviders'

const CONVERSATION = TOPIC_HUDDLES['1'][0].conversation!
const REPLY_THREAD = Object.values(REPLIES)[0] ?? []
const noop = () => {}

/** The right-docked thread panel: pinned initial message + replies + composer. */
const meta = {
  title: 'Peek/ThreadPanel',
  component: ThreadPanel,
  decorators: [
    withPeekProviders,
    (Story) => (
      <div className="h-[600px] w-[380px] border border-border-subtle rounded-lg overflow-hidden bg-bg-surface">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ThreadPanel>

export default meta

export const Default = {
  render: () => (
    <ThreadPanel conversation={CONVERSATION} replies={REPLY_THREAD} sentReplies={[]} onClose={noop} onSendReply={noop} />
  ),
}

export const Resolved = {
  render: () => (
    <ThreadPanel
      conversation={CONVERSATION}
      replies={REPLY_THREAD}
      sentReplies={[]}
      isResolved
      resolutionMsg="Pinned to 14.x."
      onClose={noop}
      onSendReply={noop}
    />
  ),
}

export const HuddleThread = {
  name: 'Huddle thread',
  render: () => (
    <ThreadPanel
      conversation={CONVERSATION}
      replies={REPLY_THREAD}
      sentReplies={[]}
      huddleMembers={['You', 'Daniel Stanton', 'Juan Foley']}
      huddleMemberCount={3}
      onClose={noop}
      onSendReply={noop}
    />
  ),
}
