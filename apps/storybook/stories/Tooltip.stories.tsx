import type { Meta } from '@storybook/react-vite'
import { Tooltip, WithTooltip, IconButton } from '@nostr-for-business/ui'
import { IconInfoCircle } from '@tabler/icons-react'

const meta = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>

export default meta

export const Bare = {
  render: () => <Tooltip label="I am a tooltip" />,
}

export const OnHover = {
  render: () => (
    <div className="flex items-center gap-6 pt-10">
      <WithTooltip label="Top placement" placement="top">
        <IconButton aria-label="Info"><IconInfoCircle size={16} stroke={1.5} /></IconButton>
      </WithTooltip>
      <WithTooltip label="Bottom placement" placement="bottom">
        <IconButton aria-label="Info"><IconInfoCircle size={16} stroke={1.5} /></IconButton>
      </WithTooltip>
    </div>
  ),
}
