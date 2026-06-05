import { cn } from './lib/cn'

interface DividerProps {
  className?: string
}

export function Divider({ className }: DividerProps) {
  return <div className={cn('h-px bg-border-subtle mx-3', className)} />
}
