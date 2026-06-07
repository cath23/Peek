import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from '@nostr-for-business/ui'
import { IconDots, IconX, IconEdit } from '@tabler/icons-react'

const meta = {
  title: 'Primitives/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: { children: <IconDots size={16} stroke={1.5} />, 'aria-label': 'More' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['muted', 'outlined', 'primary'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Muted: Story = { args: { variant: 'muted' } }
export const Outlined: Story = { args: { variant: 'outlined' } }
export const Primary: Story = { args: { variant: 'primary' } }
export const WithTooltip: Story = { args: { variant: 'muted', tooltip: 'Edit', children: <IconEdit size={16} stroke={1.5} /> } }

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {(['muted', 'outlined', 'primary'] as const).map((v) => (
        <IconButton key={v} variant={v} aria-label={v}>
          <IconX size={16} stroke={1.5} />
        </IconButton>
      ))}
    </div>
  ),
}
