import { useState } from 'react'
import type { Meta } from '@storybook/react-vite'
import { TextInput, TextArea, InputLabel } from '@nostr-for-business/ui'

const meta = {
  title: 'Inputs/Text fields',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

export const TextInputField = {
  name: 'TextInput',
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className="w-[360px] flex flex-col gap-2">
        <InputLabel required>Title</InputLabel>
        <TextInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What's this topic about?"
        />
      </div>
    )
  },
}

export const TextAreaField = {
  name: 'TextArea',
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className="w-[360px] flex flex-col gap-2">
        <InputLabel>Resolution message (optional)</InputLabel>
        <TextArea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Summarize the outcome or decision…"
          className="h-[109px]"
        />
      </div>
    )
  },
}

export const Labels = {
  render: () => (
    <div className="flex flex-col gap-3">
      <InputLabel>Optional field</InputLabel>
      <InputLabel required>Required field</InputLabel>
    </div>
  ),
}
