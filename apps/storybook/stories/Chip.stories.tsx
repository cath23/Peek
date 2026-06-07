import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chip } from '@nostr-for-business/ui'
import { IconCircleCheck, IconX } from '@tabler/icons-react'

const TYPES = ['neutral', 'brand', 'info', 'warning', 'success', 'error'] as const

const meta = {
  title: 'Primitives/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { label: 'Chip', type: 'neutral' },
  argTypes: {
    type: { control: 'inline-radio', options: TYPES },
  },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {TYPES.map((t) => (
        <Chip key={t} type={t} label={t} />
      ))}
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Chip type="success" label="Resolved" leadingIcon={<IconCircleCheck size={12} stroke={1.5} />} />
      <Chip type="brand" label="Topic" trailingIcon={<IconX size={12} stroke={1.5} />} />
      <Chip type="neutral" leadingIcon={<IconCircleCheck size={12} stroke={1.5} />} />
    </div>
  ),
}
