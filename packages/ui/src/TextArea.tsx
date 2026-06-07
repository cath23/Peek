import { type TextareaHTMLAttributes } from 'react'
import { cn } from './lib/cn'

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  className?: string
}

/**
 * Multi-line text field, styled to match {@link TextInput}. Non-resizable by default;
 * supply a height via `className` (e.g. `h-[109px]`). Font uses explicit arbitrary values
 * so tailwind-merge can't drop a custom `text-{name}` size next to `text-text-primary`.
 */
export function TextArea({ className, ...props }: TextAreaProps) {
  return (
    <textarea
      className={cn(
        'bg-bg-inset border border-border-default focus:border-border-strong rounded-lg px-3 py-2',
        'text-[14px] leading-[1.4] text-text-primary placeholder:text-text-muted resize-none outline-none transition-colors',
        className,
      )}
      {...props}
    />
  )
}
