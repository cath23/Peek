import type { Meta, StoryObj } from '@storybook/react-vite'
import { UnreadIndicator } from '@nostr-for-business/ui'

const meta = {
  title: 'Primitives/UnreadIndicator',
  component: UnreadIndicator,
  tags: ['autodocs'],
  argTypes: { urgent: { control: 'boolean' } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof UnreadIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Unread: Story = { args: { urgent: false } }
export const Urgent: Story = { args: { urgent: true } }

export const InContext: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="text-body-2 text-text-secondary">New message</span>
        <div className="w-6 h-6 flex items-center justify-center"><UnreadIndicator /></div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-body-2 text-text-secondary">Urgent</span>
        <div className="w-6 h-6 flex items-center justify-center"><UnreadIndicator urgent /></div>
      </div>
    </div>
  ),
}
