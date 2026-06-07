import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchInput } from '@nostr-for-business/ui'

const meta = {
  title: 'Primitives/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  args: { className: 'w-[290px]' },
} satisfies Meta<typeof SearchInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithShortcut: Story = { args: { shortcut: '⌘ K' } }
export const CustomPlaceholder: Story = { args: { placeholder: 'Search people…' } }
