import type { Meta } from '@storybook/react-vite'
import { AvatarStack } from '@nostr-for-business/ui'
import { MemberAvatars } from '@/components/HuddleCard'
import { Avatar } from '@/components/ui/Avatar'
import { avatarFor } from '@/data/peopleData'
import { withPeekProviders } from './_peekProviders'

/**
 * Empirical fidelity check: Peek's real MemberAvatars (canonical) rendered directly next to
 * the ui AvatarStack primitive with IDENTICAL inputs. If the primitive is a faithful
 * extraction they are pixel-identical. Rendered on bg-bg-surface (as in HuddleCard) so the
 * border-bg-surface separator ring blends exactly as it does in Peek.
 */
const meta = {
  title: 'Peek/AvatarStack fidelity check',
  decorators: [withPeekProviders],
} satisfies Meta

export default meta

const MEMBERS = ['Daniel Stanton', 'Hallie Pratt', 'Juan Foley']

export const SideBySide = {
  render: () => (
    <div className="flex flex-col gap-6 bg-bg-surface p-6 rounded-lg w-fit">
      <div className="flex flex-col gap-2">
        <span className="text-caption text-text-muted">Peek MemberAvatars (canonical)</span>
        <MemberAvatars members={MEMBERS} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-caption text-text-muted">ui AvatarStack (same inputs)</span>
        <AvatarStack avatars={MEMBERS.map((n) => ({ src: avatarFor(n), alt: n }))} overflow={false} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-caption text-text-muted">Stacked directly (should be indistinguishable)</span>
        <div className="flex items-center gap-8">
          <MemberAvatars members={MEMBERS} />
          <AvatarStack avatars={MEMBERS.map((n) => ({ src: avatarFor(n), alt: n }))} overflow={false} />
        </div>
      </div>
    </div>
  ),
}

/**
 * The -mr-2 pill variant used by ConversationHeader & ThreadPanel: the ORIGINAL hand-rolled
 * AvatarGroup (-mr-2 + container pr-2) vs the AvatarStack (-ml-2) replacement, both inside the
 * real members pill. If they match, the ConversationHeader/ThreadPanel migration is safe.
 */
export const MembersPillVariant = {
  name: 'Members pill (-mr-2 variant)',
  render: () => {
    const avatars = MEMBERS.map((n) => ({ src: avatarFor(n), alt: n }))
    return (
      <div className="flex flex-col gap-6 w-fit">
        <div className="flex flex-col gap-2">
          <span className="text-caption text-text-muted">Original AvatarGroup (-mr-2)</span>
          <div className="bg-bg-elevated border border-border-default rounded-sm flex gap-2 items-center pl-[2px] pr-2 py-[2px] w-fit">
            <div className="flex items-center pr-2">
              {MEMBERS.slice(0, 3).map((name, i) => (
                <div key={i} className="-mr-2 relative shrink-0 size-6 rounded-sm overflow-hidden border-2 border-bg-surface">
                  <Avatar size={24} name={name} alt={name} />
                </div>
              ))}
            </div>
            <span className="text-caption text-text-secondary">{MEMBERS.length}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-caption text-text-muted">AvatarStack replacement</span>
          <div className="bg-bg-elevated border border-border-default rounded-sm flex gap-2 items-center pl-[2px] pr-2 py-[2px] w-fit">
            <AvatarStack avatars={avatars} max={3} overflow={false} borderClass="border-bg-surface" />
            <span className="text-caption text-text-secondary">{MEMBERS.length}</span>
          </div>
        </div>
      </div>
    )
  },
}
