import { useState, useRef, useEffect } from 'react'
import { IconPaperclip, IconSquareForbid2, IconArrowUp } from '@tabler/icons-react'
import { IconButton } from './IconButton'
import { cn } from '@/lib/utils'

interface ComposeBoxProps {
  onSend?: (value: string) => void
  className?: string
}

export function ComposeBox({ onSend, className }: ComposeBoxProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])
  const canSend = value.trim().length > 0

  const handleSend = () => {
    if (!canSend) return
    onSend?.(value)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className={cn(
        'bg-bg-inset border border-border-default focus-within:border-border-strong rounded-lg p-3 flex flex-col gap-4 transition-colors',
        className
      )}
    >
      {/* Input area */}
      <div className="relative min-h-[20px]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="w-full bg-transparent text-sm text-text-primary resize-none outline-none leading-[1.4] placeholder:text-transparent"
        />
        {!value && (
          <div className="absolute inset-0 pointer-events-none flex items-center gap-1 text-sm text-text-muted leading-[1.4] flex-wrap">
            <span>Start a new conversation or type</span>
            <kbd className="inline-flex items-center border border-border-strong rounded-sm px-1 py-[1px] text-[12px] text-text-secondary leading-[1.2]">
              /
            </kbd>
            <span>for commands</span>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <IconButton aria-label="Attach file">
            <IconPaperclip size={16} stroke={1.5} />
          </IconButton>
          <IconButton aria-label="Snooze">
            <IconSquareForbid2 size={16} stroke={1.5} />
          </IconButton>
        </div>

        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send"
          className={cn(
            'flex items-center justify-center p-1 rounded-lg transition-colors',
            canSend
              ? 'bg-accent-primary hover:bg-accent-hover text-text-inverse cursor-pointer'
              : 'bg-bg-disabled text-text-disabled pointer-events-none'
          )}
        >
          <IconArrowUp size={16} stroke={1.5} />
        </button>
      </div>
    </div>
  )
}
