import type { Meta } from '@storybook/react-vite'
import { Divider, DateDivider } from '@nostr-for-business/ui'

const meta = {
  title: 'Primitives/Dividers',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

export const Plain = {
  render: () => (
    <div className="w-[320px]">
      <Divider />
    </div>
  ),
}

export const Dated = {
  render: () => (
    <div className="w-[320px] flex flex-col gap-4">
      <DateDivider label="Today" />
      <DateDivider label="Replies" />
    </div>
  ),
}
