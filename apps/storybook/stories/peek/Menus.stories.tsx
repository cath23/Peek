import { useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { ConversationQuickMenu } from '@/components/ConversationQuickMenu'
import { ConversationMoreMenu } from '@/components/ConversationMoreMenu'
import { TopicMenu } from '@/components/ui/TopicMenu'
import { MentionMenu } from '@/components/ui/MentionMenu'
import { FilesMenu, type FilesMenuItem } from '@/components/ui/FilesMenu'
import { DebugMenu } from '@/components/DebugMenu'
import { PEOPLE } from '@/data/peopleData'
import { TOPICS } from '@/data/topicData'
import { APP_FILES, DOCUMENT_FILES } from '@/data/filesData'
import { withPeekProviders } from './_peekProviders'

/** Peek's popover menus. In the app these are portalled/anchored by their parents; here
 *  they're rendered inline (the menu content) so each surface is visible on its own. */
const meta = {
  title: 'Peek/Menus',
  decorators: [withPeekProviders],
} satisfies Meta

export default meta

const noop = () => {}

export const QuickMenu = {
  render: () => (
    <div className="flex gap-8">
      <ConversationQuickMenu onReact={noop} onReply={noop} onResolve={noop} onMore={noop} />
      <ConversationQuickMenu isResolved onReact={noop} onReply={noop} onReopen={noop} onMore={noop} />
    </div>
  ),
}

export const MoreMenu = {
  render: () => (
    <ConversationMoreMenu
      isOwnMessage
      showCreateTopic
      onHighlight={noop}
      onCreateTopic={noop}
      onResolve={noop}
      onEditMessage={noop}
      onDelete={noop}
    />
  ),
}

export const MoreMenuResolvedTopic = {
  name: 'MoreMenu (resolved topic)',
  render: () => (
    <ConversationMoreMenu
      isTopic
      isResolved
      onRevertToConversation={noop}
      onReopen={noop}
      onViewDetails={noop}
      onDelete={noop}
    />
  ),
}

export const Topics = {
  name: 'TopicMenu',
  render: () => {
    const [highlight, setHighlight] = useState(0)
    return (
      <TopicMenu topics={TOPICS.slice(0, 5)} highlight={highlight} onSelect={noop} onHighlightChange={setHighlight} />
    )
  },
}

export const Mentions = {
  name: 'MentionMenu',
  render: () => {
    const [highlight, setHighlight] = useState(0)
    return (
      <MentionMenu people={PEOPLE.slice(0, 5)} highlight={highlight} isUrgent={false} onSelect={noop} onHighlightChange={setHighlight} />
    )
  },
}

export const Files = {
  name: 'FilesMenu',
  render: () => {
    const items: FilesMenuItem[] = [
      { kind: 'topic', data: TOPICS[0] },
      { kind: 'app', data: APP_FILES[0] },
      { kind: 'document', data: DOCUMENT_FILES[0] },
    ]
    return <FilesMenu items={items} query="" onSelect={noop} />
  },
}

export const Debug = {
  name: 'DebugMenu',
  render: () => {
    const [el, setEl] = useState<HTMLElement | null>(null)
    return (
      <div className="pb-[400px]">
        <button
          ref={setEl}
          className="px-3 py-2 rounded-lg bg-bg-inset border border-border-default text-body-2 text-text-primary"
        >
          Debug anchor
        </button>
        <DebugMenu anchorEl={el} onClose={noop} />
      </div>
    )
  },
}
