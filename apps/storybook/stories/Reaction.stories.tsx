import type { Meta, StoryObj } from '@storybook/react-vite'
import { Reaction } from '@nostr-for-business/ui'

const meta = {
  title: 'Primitives/Reaction',
  component: Reaction,
  tags: ['autodocs'],
  args: { emoji: '🚀', count: 3, owner: 'others' },
  argTypes: { owner: { control: 'inline-radio', options: ['yours', 'others'] } },
} satisfies Meta<typeof Reaction>

export default meta
type Story = StoryObj<typeof meta>

export const Others: Story = { args: { owner: 'others' } }
export const Yours: Story = { args: { owner: 'yours' } }
export const Row: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Reaction emoji="🚀" count={3} owner="yours" />
      <Reaction emoji="👍" count={5} owner="others" />
      <Reaction emoji="🎉" count={1} owner="others" />
    </div>
  ),
}
