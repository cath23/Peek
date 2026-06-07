import type { Meta, StoryObj } from '@storybook/react-vite'
import { HuddleCard } from '@/components/HuddleCard'
import { TOPIC_HUDDLES } from '@/data/huddleData'
import { withPeekProviders } from './_peekProviders'

const HUDDLE = TOPIC_HUDDLES['1'][0]

/**
 * A huddle (private sub-thread) card. `grid` is the fixed-height 2-col Huddles-tab card;
 * `inStream` is the compact inline card with a "Huddle" banner + lock icon.
 */
const meta = {
  title: 'Peek/HuddleCard',
  component: HuddleCard,
  decorators: [withPeekProviders],
  parameters: { layout: 'padded' },
  args: { huddle: HUDDLE },
} satisfies Meta<typeof HuddleCard>

export default meta
type Story = StoryObj<typeof meta>

export const Grid: Story = {
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
  args: { variant: 'grid' },
}

export const InStream: Story = {
  decorators: [(Story) => <div className="w-[560px]"><Story /></div>],
  args: { variant: 'inStream' },
}

export const Selected: Story = {
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
  args: { variant: 'grid', isSelected: true },
}
