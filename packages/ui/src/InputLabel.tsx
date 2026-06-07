import { type ReactNode } from 'react'
import { cn } from './lib/cn'

interface InputLabelProps {
  children: ReactNode
  /** Appends a red required asterisk. */
  required?: boolean
  htmlFor?: string
  className?: string
}

/**
 * Field label for form inputs (12px / medium). When `required`, appends a red asterisk.
 * Font uses explicit arbitrary values so tailwind-merge can't drop the custom size class
 * next to `text-text-primary`.
 */
export function InputLabel({ children, required = false, htmlFor, className }: InputLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-[12px] leading-[1.15] font-medium text-text-primary',
        required && 'flex items-center',
        className,
      )}
    >
      {children}
      {required && <span className="text-error-default ml-0.5">*</span>}
    </label>
  )
}
