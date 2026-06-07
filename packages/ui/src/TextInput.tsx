import { type InputHTMLAttributes } from 'react'
import { cn } from './lib/cn'

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  className?: string
}

/**
 * Single-line text field: inset background, bordered, focus indicated by a stronger border.
 * A controlled `<input>` — pass value/onChange/placeholder/etc. through.
 * Font is set with explicit arbitrary values (14px/1.4) so tailwind-merge can't drop a
 * custom `text-{name}` size class when it sits next to `text-text-primary`.
 */
export function TextInput({ className, type = 'text', ...props }: TextInputProps) {
  return (
    <input
      type={type}
      className={cn(
        'bg-bg-inset border border-border-default focus:border-border-strong rounded-lg px-3 py-2',
        'text-[14px] leading-[1.4] text-text-primary placeholder:text-text-muted outline-none transition-colors',
        className,
      )}
      {...props}
    />
  )
}
