import { HIGHLIGHT_META, type HighlightType } from '@/data/topicData'
import { cn } from '@/lib/utils'

interface HighlightPillProps {
  type: HighlightType
  className?: string
}

export function HighlightPill({ type, className }: HighlightPillProps) {
  const meta = HIGHLIGHT_META[type]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm bg-accent-muted text-[11px] font-medium leading-none whitespace-nowrap shrink-0',
        className
      )}
    >
      <span
        className="size-[10px] rounded-[2px] shrink-0"
        style={{ backgroundColor: meta.color }}
      />
      <span className="text-text-primary">{meta.label}</span>
    </span>
  )
}

/** Inline color swatch for menus — 12×12 dot in a 20×20 box */
export function HighlightSwatch({ type, className }: { type: HighlightType; className?: string }) {
  const meta = HIGHLIGHT_META[type]
  return (
    <span className={cn('inline-flex items-center justify-center size-5 shrink-0', className)}>
      <span
        className="size-3 rounded-[3px]"
        style={{ backgroundColor: meta.color }}
      />
    </span>
  )
}
