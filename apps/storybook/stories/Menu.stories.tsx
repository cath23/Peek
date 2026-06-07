import type { Meta } from '@storybook/react-vite'
import { Menu, MenuItem, MenuSection, Divider } from '@nostr-for-business/ui'
import { IconCircleCheck, IconCircleDashed, IconPlus } from '@tabler/icons-react'

const meta = {
  title: 'Overlays/Menu',
  component: Menu,
  tags: ['autodocs'],
} satisfies Meta<typeof Menu>

export default meta

export const Default = {
  render: () => (
    <Menu className="w-[244px]">
      <MenuSection title="Utilities">
        <MenuItem
          icon={<IconCircleDashed size={16} stroke={1.5} className="text-text-secondary" />}
          label="Start topic"
        />
        <MenuItem
          icon={<IconCircleCheck size={16} stroke={1.5} className="text-text-secondary" />}
          label="Resolve"
          shortcut="→"
        />
        <MenuItem
          icon={<IconPlus size={16} stroke={1.5} className="text-text-secondary" />}
          label="Open work"
        />
      </MenuSection>
      <Divider className="mx-0" />
      <MenuSection>
        <MenuItem label="View details" />
        <MenuItem label="Disabled item" disabled />
        <MenuItem label="Delete" destructive />
      </MenuSection>
    </Menu>
  ),
}
