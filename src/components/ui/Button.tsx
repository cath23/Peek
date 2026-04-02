import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'outlined' | 'muted'
type ButtonSize = 'default' | 'small'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

export function Button({
  variant = 'muted',
  size = 'default',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors',
        size === 'default' && 'h-8 px-2 text-btn-default',
        size === 'small'   && 'h-6 px-1 text-btn-small',
        // Active variants
        !disabled && variant === 'primary'  && 'bg-accent-primary hover:bg-accent-hover text-accent-muted cursor-pointer',
        !disabled && variant === 'outlined' && 'border border-border-default hover:bg-bg-hover text-text-primary cursor-pointer',
        !disabled && variant === 'muted'    && 'hover:bg-bg-hover text-text-primary cursor-pointer',
        // Disabled — shared base; outlined keeps its border
        disabled && 'bg-bg-disabled text-text-disabled pointer-events-none',
        disabled && variant === 'outlined' && 'border border-border-default',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
