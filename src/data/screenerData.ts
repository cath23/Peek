import type { TopicStateStatus } from '@/components/ui/TopicState'

export type ScreenerItem =
  | {
      id: string
      kind: 'topic'
      topicTitle: string
      topicStatus: TopicStateStatus
      preview: string
    }
  | {
      id: string
      kind: 'dm'
      authorName: string
      authorAvatarSrc?: string
      preview: string
    }

export const SCREENER_ITEMS: ScreenerItem[] = [
  {
    id: 'sc_1',
    kind: 'topic',
    topicTitle: 'Updates on the new office layout',
    topicStatus: 'unresolved',
    preview:
      'Facilities shared the Q3 floor plan and is asking each team for desk allocations by Friday. Worth a look before the deadline so design gets the corner cluster we discussed.',
  },
  {
    id: 'sc_2',
    kind: 'dm',
    authorName: 'Amie Miles',
    preview:
      "Q4 platform allocation needs your sign-off by Friday - we're trading two weeks of payments work for the auth migration. Want to make sure it lands with you before I bring it to leadership.",
  },
]
