import { useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { ChipInput, Avatar } from '@nostr-for-business/ui'

const meta = {
  title: 'Shells/ChipInput',
  component: ChipInput,
  tags: ['autodocs'],
} satisfies Meta<typeof ChipInput>

export default meta

interface Item { id: string; name: string; role: string }
const PEOPLE: Item[] = [
  { id: '1', name: 'Alice Johnson', role: 'Design' },
  { id: '2', name: 'Daniel Stanton', role: 'Engineering' },
  { id: '3', name: 'Hallie Pratt', role: 'Product' },
  { id: '4', name: 'Zack Bright', role: 'Marketing' },
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
          renderChip={(p) => (
            <>
              <Avatar size={16} alt={p.name} className="rounded-full" />
              <span className="text-[12px] leading-[1.2] font-medium text-text-primary">{p.name}</span>
            </>
          )}
          renderOption={(p) => (
            <>
              <Avatar size={32} alt={p.name} />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="text-[14px] leading-[1.4] text-text-primary truncate">{p.name}</div>
                <div className="text-[12px] leading-[1.2] text-text-secondary truncate">{p.role}</div>
              </div>
            </>
          )}
        />
      </div>
    )
  },
}
