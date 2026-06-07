import type { Meta, StoryObj } from '@storybook/react-vite'
import { ComposeBox } from '@/components/ui/ComposeBox'
import { withPeekProviders } from './_peekProviders'

/**
 * Peek's Tiptap-based message composer (over the shared Composer shell). Supports
 * @mentions, [topic refs, !@urgent, and the `/` command menu — try typing in it.
 */
const meta = {
  title: 'Peek/ComposeBox',
  component: ComposeBox,
  decorators: [
    withPeekProviders,
    (Story) => <div className="w-[560px]"><Story /></div>,
  ],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ComposeBox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { onSend: () => {} },
}

export const ReplyPlaceholder: Story = {
  args: { onSend: () => {}, placeholder: 'reply' },
}
