import { useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { ChipInput, Avatar } from '@nostr-for-business/ui'

const meta = {
  title: 'Shells/ChipInput',
  component: ChipInput,
  tags: ['autodocs'],
} satisfies Meta<typeof ChipInput>

export default meta

interface Item { id: string; name: string; role: string; avatar: string }
const PEOPLE: Item[] = [
  { id: '1', name: 'Alice Johnson', role: 'Design', avatar: 'https://i.pravatar.cc/100?img=5' },
  { id: '2', name: 'Daniel Stanton', role: 'Engineering', avatar: 'https://i.pravatar.cc/100?img=12' },
  { id: '3', name: 'Hallie Pratt', role: 'Product', avatar: 'https://i.pravatar.cc/100?img=24' },
  { id: '4', name: 'Zack Bright', role: 'Marketing', avatar: 'https://i.pravatar.cc/100?img=33' },
]

export const People = {
  render: () => {
    const [value, setValue] = useState<Item[]>([PEOPLE[0]])
    return (
      <div className="w-[360px]">
        <ChipInput<Item>
          value={value}
          onChange={setValue}
          suggestions={PEOPLE}
          getKey={(p) => p.id}
          filterFn={(p, q) => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)}
          placeholder="Search people…"
          // Matches Peek's PersonChipInput token-for-token: chip avatar is rounded-full,
          // option avatar uses the default radius, option column is gap-[2px] justify-center
          // with a font-normal name.
          renderChip={(p) => (
            <>
              <Avatar size={16} src={p.avatar} alt={p.name} className="rounded-full" />
              <span className="text-[12px] leading-[1.2] font-medium text-text-primary">{p.name}</span>
            </>
          )}
          renderOption={(p) => (
            <>
              <Avatar size={32} src={p.avatar} alt={p.name} />
              <div className="flex flex-col flex-1 min-w-0 gap-[2px] justify-center">
                <div className="text-[14px] font-normal leading-[1.4] text-text-primary truncate">{p.name}</div>
                <div className="text-[12px] leading-[1.2] text-text-secondary truncate">{p.role}</div>
              </div>
            </>
          )}
        />
      </div>
    )
  },
}
