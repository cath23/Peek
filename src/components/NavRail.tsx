import {
  IconNote,
  IconMessage2,
  IconUsers,
  IconBrackets,
  IconFiles,
} from '@tabler/icons-react'
import { NavItem } from './NavItem'

const NAV_ITEMS = [
  { to: '/desk',   icon: <IconNote size={16} stroke={1.5} />,     label: 'Desk' },
  { to: '/topics', icon: <IconMessage2 size={16} stroke={1.5} />, label: 'Topics' },
  { to: '/people', icon: <IconUsers size={16} stroke={1.5} />,    label: 'People' },
  { to: '/views',  icon: <IconBrackets size={16} stroke={1.5} />, label: 'Views' },
  { to: '/files',  icon: <IconFiles size={16} stroke={1.5} />,    label: 'Files' },
]

export function NavRail() {
  return (
    <nav className="w-16 flex flex-col gap-2 items-start px-2 py-3 shrink-0">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>
  )
}
