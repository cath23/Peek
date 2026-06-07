import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@nostr-for-business/ui'
import { IconPlus } from '@tabler/icons-react'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Button' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'outlined', 'muted'] },
    size: { control: 'inline-radio', options: ['default', 'small'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { variant: 'primary' } }
export const Outlined: Story = { args: { variant: 'outlined' } }
export const Muted: Story = { args: { variant: 'muted' } }
export const Small: Story = { args: { variant: 'primary', size: 'small' } }
export const WithLeadingIcon: Story = {
  args: { variant: 'primary', leadingIcon: <IconPlus size={16} stroke={1.5} /> },
}
export const Disabled: Story = { args: { variant: 'primary', disabled: true } }

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['primary', 'outlined', 'muted'] as const).map((v) => (
        <div key={v} className="flex items-center gap-3">
          <Button variant={v}>{v}</Button>
          <Button variant={v} size="small">{v} small</Button>
          <Button variant={v} disabled>{v} disabled</Button>
        </div>
      ))}
    </div>
  ),
}
