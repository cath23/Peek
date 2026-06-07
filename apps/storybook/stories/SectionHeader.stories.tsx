import type { Meta, StoryObj } from '@storybook/react-vite'
import { SectionHeader } from '@nostr-for-business/ui'

const meta = {
  title: 'Primitives/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  args: { title: 'Topics' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SectionHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { render: (args) => <div className="w-[260px]"><SectionHeader {...args} /></div> }
export const Collapsible: Story = {
  render: (args) => <div className="w-[260px]"><SectionHeader {...args} chevron isExpanded /></div>,
}
export const WithActions: Story = {
  render: (args) => (
    <div className="w-[260px]">
      <SectionHeader {...args} prop1stAction prop2ndAction />
      <p className="text-caption text-text-muted mt-2">(hover to reveal actions)</p>
    </div>
  ),
}
