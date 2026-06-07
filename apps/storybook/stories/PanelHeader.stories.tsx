import type { Meta, StoryObj } from '@storybook/react-vite'
import { PanelHeader } from '@nostr-for-business/ui'

const meta = {
  title: 'Layout/PanelHeader',
  component: PanelHeader,
  tags: ['autodocs'],
  args: { title: 'Topics' },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="w-[320px] border border-border-subtle rounded-lg overflow-hidden bg-bg-surface">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PanelHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLeadingIcon: Story = {
  args: { title: 'All topics', leadingIcon: true, chevron: true },
}

export const WithActions: Story = {
  args: {
    title: 'People',
    prop1stAction: true,
    prop1stActionTooltip: 'New conversation',
    prop2ndAction: true,
    prop2ndActionTooltip: 'Sort',
  },
}
