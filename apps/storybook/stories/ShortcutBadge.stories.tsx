import type { Meta, StoryObj } from '@storybook/react-vite'
import { ShortcutBadge } from '@nostr-for-business/ui'

const meta = {
  title: 'Primitives/ShortcutBadge',
  component: ShortcutBadge,
  tags: ['autodocs'],
  args: { children: '⌘ K' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ShortcutBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <ShortcutBadge>⌘ K</ShortcutBadge>
      <ShortcutBadge>→</ShortcutBadge>
      <ShortcutBadge className="min-w-[18px]">/</ShortcutBadge>
      <ShortcutBadge className="bg-transparent">/</ShortcutBadge>
    </div>
  ),
}

/** In context: a command hint with a transparent inline key. */
export const InlineHint: Story = {
  render: () => (
    <span className="flex items-center gap-1 text-[12px] text-text-secondary">
      Start a new conversation or type
      <ShortcutBadge className="bg-transparent">/</ShortcutBadge>
      for commands
    </span>
  ),
}
