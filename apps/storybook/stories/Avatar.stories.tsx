import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from '@nostr-for-business/ui'

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { size: 36, alt: 'User' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

// Note: the global Avatar is pure (src only). Name->src resolution is Peek's wrapper.
export const Placeholder: Story = { args: {} }

export const WithImage: Story = {
  args: { src: 'https://i.pravatar.cc/100?img=12' },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      {[16, 24, 32, 36].map((s) => (
        <Avatar key={s} size={s} src="https://i.pravatar.cc/100?img=5" alt="User" />
      ))}
    </div>
  ),
}
