import type { Meta } from '@storybook/react-vite'
import { ListRow, Avatar, IconButton, UnreadIndicator } from '@nostr-for-business/ui'
import { IconDotsVertical, IconHash } from '@tabler/icons-react'

const meta = {
  title: 'Primitives/ListRow',
  component: ListRow,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="w-[290px]"><Story /></div>],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ListRow>

export default meta

const AVATAR = (n: number) => <Avatar size={20} src={`https://i.pravatar.cc/100?img=${n}`} className="rounded-full" />

export const Default = {
  render: () => (
    <ListRow leading={AVATAR(12)} title="Daniel Stanton" />
  ),
}

export const WithSubtitle = {
  render: () => (
    <ListRow leading={AVATAR(5)} title="Hallie Pratt" subtitle="Product" />
  ),
}

export const Selected = {
  render: () => (
    <ListRow leading={<IconHash size={16} stroke={1.5} className="text-text-secondary" />} title="design-review" selected />
  ),
}

export const HoverAction = {
  name: 'Trailing reacts to hover',
  render: () => (
    <div className="flex flex-col">
      <ListRow
        leading={AVATAR(24)}
        title="Hover me — action appears"
        trailing={(hovered) =>
          hovered ? (
            <IconButton aria-label="More"><IconDotsVertical size={16} stroke={1.5} /></IconButton>
          ) : null
        }
      />
      <ListRow
        leading={AVATAR(33)}
        title="Unread row"
        titleClassName="font-medium text-text-primary"
        trailing={<div className="w-6 h-6 flex items-center justify-center"><UnreadIndicator /></div>}
      />
    </div>
  ),
}
