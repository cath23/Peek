import { Avatar as BaseAvatar } from '@nostr-for-business/ui'
import { avatarFor } from '@/data/peopleData'

interface AvatarProps {
  src?: string
  /** When src is not provided, resolves the avatar by author name from PEOPLE. */
  name?: string
  alt?: string
  size?: number
  className?: string
}

/**
 * Peek avatar: resolves an image by person name via avatarFor, then renders the shared
 * Avatar primitive. Keeps Peek's name-based API while the global primitive stays pure.
 */
export function Avatar({ src, name, alt = '', size = 36, className }: AvatarProps) {
  const resolved = src ?? avatarFor(name) ?? avatarFor(alt)
  return <BaseAvatar src={resolved} alt={alt || name || ''} size={size} className={className} />
}
