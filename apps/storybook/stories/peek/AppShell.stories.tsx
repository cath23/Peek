import type { Meta } from '@storybook/react-vite'
import { AppShell } from '@/layouts/AppShell'
import { PanelHeader } from '@nostr-for-business/ui'
import { PersonRow } from '@/components/ui/PersonRow'
import { ConversationHeader } from '@/components/ConversationHeader'
import { ConversationCard } from '@/components/ConversationCard'
import { withPeekProviders } from './_peekProviders'

/**
 * The assembled Peek frame: the shared AppShell layout filled with Peek's real TopBar +
 * NavRail (via layouts/AppShell) and sample left/right panels built from real Peek components.
 */
const meta = {
  title: 'Peek/AppShell',
  decorators: [withPeekProviders],
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

function LeftPanel() {
  return (
    <div className="flex flex-col h-full">
      <PanelHeader title="All topics" leadingIcon chevron prop2ndAction prop2ndActionTooltip="Sort" />
      <div className="flex-1 overflow-y-auto p-2 flex flex-col">
        <PersonRow name="CI/CD pipeline" type="topic" topicStatus="unresolved" memberCount={3} isSelected />
        <PersonRow name="Launch checklist v2" type="topic" topicStatus="unresolved" memberCount={5} isUnread />
        <PersonRow name="Onboarding issues" type="topic" topicStatus="unresolved" memberCount={4} />
        <PersonRow name="Remote work policy" type="topic" topicStatus="resolved" memberCount={6} />
        <PersonRow name="Daniel Stanton" type="DM" isUnread isUrgent />
      </div>
    </div>
  )
}

function RightPanel() {
  return (
    <div className="flex flex-col h-full">
      <ConversationHeader
        topicMode
        name="CI/CD pipeline stuck during build stage"
        openCount={2}
        resolvedCount={3}
        members={['You', 'Daniel Stanton', 'Juan Foley']}
        isStarred
      />
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        <ConversationCard
          authorName="Daniel Stanton"
          timestamp="9:40 AM"
          body="The dep conflict looks like @testing-library/react 15.x — can you confirm which lockfile?"
          replyCount={3}
          hasNewReply
        />
        <ConversationCard
          authorName="Juan Foley"
          timestamp="9:52 AM"
          body="Confirmed — pinned to 14.x and the build is green again."
          isResolved
          resolvedBy="Juan Foley"
          resolutionMessage="Pinned @testing-library/react to 14.x."
        />
      </div>
    </div>
  )
}

export const Default = {
  render: () => <AppShell leftPanel={<LeftPanel />} rightPanel={<RightPanel />} />,
}
