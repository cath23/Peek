import { useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { NavRail, NavItem } from '@nostr-for-business/ui'
import { IconNote, IconHash, IconUsers } from '@tabler/icons-react'

const meta = {
  title: 'Layout/NavRail',
  component: NavRail,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof NavRail>

export default meta

const ITEMS = [
  { icon: <IconNote size={16} stroke={1.5} />, label: 'Desk' },
  { icon: <IconHash size={16} stroke={1.5} />, label: 'Topics' },
  { icon: <IconUsers size={16} stroke={1.5} />, label: 'People' },
]

export const Default = {
  render: () => {
    const [active, setActive] = useState(0)
    return (
      <div className="bg-bg-surface rounded-2xl w-fit">
        <NavRail>
          {ITEMS.map((it, i) => (
            <NavItem key={i} icon={it.icon} label={it.label} active={i === active} onClick={() => setActive(i)} />
          ))}
        </NavRail>
      </div>
    )
  },
}
