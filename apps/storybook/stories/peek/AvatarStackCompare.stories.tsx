import type { Meta } from '@storybook/react-vite'
import { AvatarStack } from '@nostr-for-business/ui'
import { MemberAvatars } from '@/components/HuddleCard'
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
