import { useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { Composer, IconButton } from '@nostr-for-business/ui'
import { IconPaperclip, IconMoodSmile } from '@tabler/icons-react'

const meta = {
  title: 'Shells/Composer',
  component: Composer,
  tags: ['autodocs'],
} satisfies Meta<typeof Composer>

export default meta

export const Default = {
  render: () => {
    const [text, setText] = useState('')
    return (
      <div className="w-[420px]">
        <Composer
          canSend={text.trim().length > 0}
          onSend={() => setText('')}
          tools={
            <>
              <IconButton aria-label="Attach"><IconPaperclip size={16} stroke={1.5} /></IconButton>
              <IconButton aria-label="Emoji"><IconMoodSmile size={16} stroke={1.5} /></IconButton>
            </>
          }
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message…"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none resize-none min-h-[20px]"
          />
        </Composer>
      </div>
    )
  },
}
