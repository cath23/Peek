import type { Meta } from '@storybook/react-vite'
import { ResolveDialog } from '@/components/ResolveDialog'
import { CreateTopicDialog } from '@/components/CreateTopicDialog'
import { StartHuddleDialog } from '@/components/StartHuddleDialog'
import { PEOPLE } from '@/data/peopleData'
import { withPeekProviders } from './_peekProviders'

/** Peek's modal dialogs (portalled over a backdrop, built on the shared DialogShell). */
const meta = {
  title: 'Peek/Dialogs',
  decorators: [withPeekProviders],
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

const noop = () => {}

export const Resolve = {
  render: () => <ResolveDialog onResolve={noop} onCancel={noop} />,
}

export const CreateTopic = {
  render: () => <CreateTopicDialog onConfirm={noop} onCancel={noop} />,
}

export const CreateTopicFromDm = {
  name: 'CreateTopic (from DM)',
  render: () => (
    <CreateTopicDialog
      defaultInvitees={PEOPLE.slice(0, 2)}
      dmContext={{ participants: PEOPLE.slice(0, 2) }}
      onConfirm={noop}
      onCancel={noop}
    />
  ),
}

export const StartHuddle = {
  render: () => <StartHuddleDialog onConfirm={noop} onCancel={noop} />,
}
