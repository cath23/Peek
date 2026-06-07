import { useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { PersonChipInput } from '@/components/ui/PersonChipInput'
import { PEOPLE, type Person } from '@/data/peopleData'

/** Peek's people picker: supplies PEOPLE + avatar/role rows to the shared ChipInput. */
const meta = {
  title: 'Peek/PersonChipInput',
  component: PersonChipInput,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="w-[360px]"><Story /></div>],
} satisfies Meta<typeof PersonChipInput>

export default meta

export const Default = {
  render: () => {
    const [value, setValue] = useState<Person[]>([PEOPLE[0]])
    return <PersonChipInput value={value} onChange={setValue} placeholder="Search people..." />
  },
}

export const Empty = {
  render: () => {
    const [value, setValue] = useState<Person[]>([])
    return <PersonChipInput value={value} onChange={setValue} placeholder="Search people..." />
  },
}
