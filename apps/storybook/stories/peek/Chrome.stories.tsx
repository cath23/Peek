import type { Meta } from '@storybook/react-vite'
import { IconNote, IconMessage2, IconUsers } from '@tabler/icons-react'
import { NavItem } from '@/components/NavItem'
import { NavRail } from '@/components/NavRail'
import { TopBar } from '@/components/TopBar'
import { withPeekProviders } from './_peekProviders'

/**
 * Peek app chrome — coupled to react-router and Peek state, so these render inside the
 * Peek provider tree (MemoryRouter starts at /topics, so the Topics item shows active).
 */
const meta = {
  title: 'Peek/Chrome',
  decorators: [withPeekProviders],
} satisfies Meta

export default meta

export const NavItems = {
  name: 'NavItem',
  render: () => (
    <nav className="w-16 flex flex-col gap-2 items-start px-2 py-3 bg-bg-surface rounded-2xl">
      <NavItem to="/desk" icon={<IconNote size={16} stroke={1.5} />} label="Desk" />
      <NavItem to="/topics" icon={<IconMessage2 size={16} stroke={1.5} />} label="Topics" />
      <NavItem to="/people" icon={<IconUsers size={16} stroke={1.5} />} label="People" />
    </nav>
  ),
}

export const Rail = {
  name: 'NavRail',
  render: () => (
    <div className="bg-bg-surface rounded-2xl w-fit">
      <NavRail />
    </div>
  ),
}

export const Bar = {
  name: 'TopBar',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="relative h-[52px] w-full min-w-[720px] bg-bg-base">
      <TopBar />
    </div>
  ),
}
