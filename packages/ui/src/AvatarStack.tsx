import { cn } from './lib/cn'
import { Avatar } from './Avatar'

interface AvatarStackProps {
  /** Avatars to show, in order. Pre-resolve sources in the consuming app. */
  avatars: { src?: string; alt?: string }[]
  /** Max avatars before collapsing the rest into a "+N" chip. Default 4. */
  max?: number
  /** Avatar edge length in px. Default 24. */
  size?: number
  /** Border ring around each avatar (sits over the page bg to separate overlaps). */
  borderClass?: string
  /** Show a trailing "+N" overflow chip when there are more than `max`. Default true. */
  overflow?: boolean
  className?: string
}

/**
 * Overlapping row of avatars with an optional "+N" overflow chip. Pure/presentational —
 * apps that resolve an image by name/id should map to `{ src }` and wrap this (see Peek's
 * MemberAvatars in HuddleCard).
 */
export function AvatarStack({
  avatars,
  max = 4,
  size = 24,
  borderClass = 'border-bg-surface',
  overflow = true,
  className,
}: AvatarStackProps) {
  const shown = avatars.slice(0, max)
  const extra = avatars.length - shown.length

  return (
    <div className={cn('flex items-center', className)}>
      {shown.map((a, i) => (
        <div
          key={i}
          className={cn('relative shrink-0 rounded-sm overflow-hidden border-2', i > 0 && '-ml-2', borderClass)}
          style={{ width: size, height: size }}
        >
          <Avatar src={a.src} alt={a.alt} size={size} />
        </div>
      ))}
      {overflow && extra > 0 && (
        <div
          className={cn(
            'relative shrink-0 -ml-2 rounded-sm border-2 bg-bg-inset flex items-center justify-center',
            borderClass,
          )}
          style={{ width: size, height: size }}
        >
          <span className="text-[10px] leading-none font-medium text-text-secondary">+{extra}</span>
        </div>
      )}
    </div>
  )
}
