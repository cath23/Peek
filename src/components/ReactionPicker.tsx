import { cn } from '@/lib/utils'

export const REACTION_EMOJIS = ['👍', '💯', '🙏', '🚀', '🎉']

interface ReactionPickerProps {
  onSelect: (emoji: string) => void
  className?: string
}

export default function ReactionPicker({ onSelect, className }: ReactionPickerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-lg border border-border-default bg-bg-elevated p-1.5',
        'shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.4),0px_10px_15px_-3px_rgba(0,0,0,0.5)]',
        className,
      )}
    >
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[18px] hover:bg-bg-hover"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
