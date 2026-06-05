import { cn } from './lib/cn'

interface AvatarProps {
  /** Image source. When omitted, a placeholder block is rendered. */
  src?: string
  alt?: string
  size?: number
  className?: string
}

/**
 * Pure avatar primitive: renders an image or a placeholder block. It does NOT resolve
 * sources by name — apps that map a person/name to an image should wrap this (see Peek's
 * components/ui/Avatar.tsx).
 */
export function Avatar({ src, alt = '', size = 36, className }: AvatarProps) {
  return (
    <div
      className={cn('rounded-sm overflow-hidden shrink-0 bg-bg-inset', className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-accent-muted" />
      )}
    </div>
  )
}
