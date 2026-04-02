import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  size?: number
  className?: string
}

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
