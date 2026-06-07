import type { Meta } from '@storybook/react-vite'
import { TopicState, type TopicStateType } from '@/components/ui/TopicState'
import { HighlightPill, HighlightSwatch } from '@/components/ui/HighlightPill'
import ReactionPicker from '@/components/ReactionPicker'
import { PersonRow } from '@/components/ui/PersonRow'
import type { HighlightType } from '@/data/topicData'
import { withPeekProviders } from './_peekProviders'

/** Small Peek presentational atoms (used inside cards, rows, and pickers). */
const meta = {
  title: 'Peek/Atoms',
  decorators: [withPeekProviders],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

const TYPES: TopicStateType[] = ['topic', 'DM', 'huddle', 'team', 'group', 'view']
const HIGHLIGHTS: HighlightType[] = ['insight', 'concern', 'conclusion', 'question', 'summary']

export const States = {
  name: 'TopicState',
  render: () => (
    <div className="flex flex-col gap-3">
      {(['unresolved', 'resolved', 'default'] as const).map((status) => (
        <div key={status} className="flex items-center gap-4">
          <span className="w-20 text-caption text-text-muted">{status}</span>
          {TYPES.map((type) => (
            <TopicState key={type} type={type} status={status} />
          ))}
        </div>
      ))}
    </div>
  ),
}

export const Highlights = {
  name: 'HighlightPill / Swatch',
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {HIGHLIGHTS.map((t) => <HighlightPill key={t} type={t} />)}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {HIGHLIGHTS.map((t) => <HighlightSwatch key={t} type={t} />)}
      </div>
    </div>
  ),
}

export const Reactions = {
  name: 'ReactionPicker',
  render: () => <ReactionPicker onSelect={() => {}} />,
}

export const Rows = {
  name: 'PersonRow',
  render: () => (
    <div className="w-[290px] flex flex-col">
      <PersonRow name="Daniel Stanton" type="DM" />
      <PersonRow name="Hallie Pratt" type="DM" isUnread />
      <PersonRow name="Juan Foley" type="DM" isUnread isUrgent />
      <PersonRow name="CI/CD pipeline" type="topic" topicStatus="unresolved" memberCount={3} />
      <PersonRow name="Remote work policy" type="topic" topicStatus="resolved" memberCount={5} />
      <PersonRow name="Design huddle" type="huddle" isSelected />
    </div>
  ),
}
