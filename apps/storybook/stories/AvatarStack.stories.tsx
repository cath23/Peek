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
  // The 2px `borderClass` is a SEPARATOR RING meant to match the surface behind the stack
  // (default border-bg-surface). Render on bg-bg-surface — as in Peek — so it blends and the
  // avatars read as seamlessly overlapping, instead of looking like errant spacing on bg-base.
  decorators: [(Story) => <div className="bg-bg-surface rounded-lg p-4 inline-block"><Story /></div>],
} satisfies Meta<typeof AvatarStack>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

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
