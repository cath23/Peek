import type { Meta, StoryObj } from '@storybook/react-vite'
import { AvatarStack } from '@nostr-for-business/ui'

const SRC = (n: number) => `https://i.pravatar.cc/100?img=${n}`
const AVATARS = [1, 5, 12, 24, 33, 47].map((n) => ({ src: SRC(n), alt: `User ${n}` }))

const meta = {
  title: 'Primitives/AvatarStack',
  component: AvatarStack,
  tags: ['autodocs'],
  args: { avatars: AVATARS.slice(0, 3), size: 24 },
  parameters: { layout: 'padded' },
  // Render on bg-bg-surface (as in Peek's HuddleCard / members pill) so the default
  // border-bg-surface separator ring blends and the avatars read as seamlessly overlapping.
  decorators: [(Story) => <div className="bg-bg-surface rounded-lg p-3 inline-block"><Story /></div>],
} satisfies Meta<typeof AvatarStack>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Peek's exact members-pill usage (ConversationHeader): stack + total count in an elevated pill. */
export const MembersPill: Story = {
  render: () => (
    <div className="bg-bg-elevated border border-border-default rounded-sm flex gap-2 items-center pl-[2px] pr-2 py-[2px] w-fit">
      <AvatarStack avatars={AVATARS.slice(0, 3)} overflow={false} borderClass="border-bg-surface" />
      <span className="text-caption text-text-secondary">{AVATARS.length}</span>
    </div>
  ),
}

export const WithOverflow: Story = {
  args: { avatars: AVATARS, max: 4 },
}

export const NoOverflow: Story = {
  args: { avatars: AVATARS, max: 4, overflow: false },
}

export const Placeholders: Story = {
  args: { avatars: [{}, {}, {}] },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {[16, 24, 32].map((s) => (
        <AvatarStack key={s} avatars={AVATARS} size={s} max={4} />
      ))}
    </div>
  ),
}
