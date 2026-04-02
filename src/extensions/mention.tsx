import { forwardRef, useEffect, useImperativeHandle, useState, useCallback } from 'react'
import { ReactRenderer, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import Mention from '@tiptap/extension-mention'
import { type SuggestionOptions, type SuggestionProps } from '@tiptap/suggestion'
import { type NodeViewProps } from '@tiptap/react'
import { IconCircleDashed, IconCircleCheck, IconLockFilled } from '@tabler/icons-react'
import { PEOPLE, type Person } from '@/data/peopleData'
import { TOPICS, type Topic } from '@/data/topicData'
import { MentionMenu } from '@/components/ui/MentionMenu'
import { TopicMenu } from '@/components/ui/TopicMenu'

// ─── Types ───

type MentionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

interface MentionListProps extends SuggestionProps {
  isUrgent: boolean
}

// ─── React wrapper around MentionMenu with keyboard navigation ───

const MentionListWrapper = forwardRef<MentionListRef, MentionListProps>(
  (props, ref) => {
    const [highlight, setHighlight] = useState(0)

    useEffect(() => setHighlight(0), [props.items])

    const selectItem = useCallback(
      (person: Person) => props.command(person),
      [props]
    )

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowDown') {
          setHighlight((h) => Math.min(h + 1, props.items.length - 1))
          return true
        }
        if (event.key === 'ArrowUp') {
          setHighlight((h) => Math.max(h - 1, 0))
          return true
        }
        if (event.key === 'Enter') {
          const person = props.items[highlight]
          if (person) selectItem(person)
          return true
        }
        return false
      },
    }))

    if (props.items.length === 0) return null

    return (
      <MentionMenu
        people={props.items}
        highlight={highlight}
        isUrgent={props.isUrgent}
        onSelect={selectItem}
        onHighlightChange={setHighlight}
      />
    )
  }
)
MentionListWrapper.displayName = 'MentionListWrapper'

// ─── Global flag: is a suggestion popup currently open? ───
// Counter instead of boolean — multiple suggestion plugins (mention, urgent, topic)
// can overlap during transitions, so we track how many are open.
let _openCount = 0
let _lastCloseTime = 0

export function isSuggestionActive(): boolean {
  return _openCount > 0 || (Date.now() - _lastCloseTime < 100)
}

// ─── Suggestion popup controller ───

class SuggestionPopup {
  component: ReactRenderer<MentionListRef> | null = null
  container: HTMLDivElement | null = null

  onStart(props: SuggestionProps, isUrgent: boolean) {
    _openCount++
    this.component = new ReactRenderer(MentionListWrapper, {
      props: { ...props, isUrgent },
      editor: props.editor,
    })

    this.container = document.createElement('div')
    this.container.style.position = 'fixed'
    this.container.style.zIndex = '50'
    document.body.appendChild(this.container)
    this.container.appendChild(this.component.element)
    this.updatePosition(props)
  }

  onUpdate(props: SuggestionProps, isUrgent: boolean) {
    this.component?.updateProps({ ...props, isUrgent })
    this.updatePosition(props)
  }

  onKeyDown(props: { event: KeyboardEvent }) {
    if (props.event.key === 'Escape') {
      this.onExit()
      return true
    }
    return this.component?.ref?.onKeyDown(props) ?? false
  }

  onExit() {
    _openCount = Math.max(0, _openCount - 1)
    _lastCloseTime = Date.now()
    this.component?.destroy()
    this.container?.remove()
    this.component = null
    this.container = null
  }

  private updatePosition(props: SuggestionProps) {
    if (!this.container || !props.clientRect) return
    const rect = (props.clientRect as () => DOMRect)()
    if (!rect) return
    this.container.style.left = `${rect.left}px`
    this.container.style.bottom = `${window.innerHeight - rect.top + 8}px`
    this.container.style.top = ''
  }
}

// ─── Suggestion config factory ───

function makeSuggestion(isUrgent: boolean): Omit<SuggestionOptions<Person>, 'editor'> {
  return {
    items: ({ query }) =>
      PEOPLE.filter((p) =>
        query === '' || p.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6),

    render: () => {
      const popup = new SuggestionPopup()
      return {
        onStart: (props) => popup.onStart(props, isUrgent),
        onUpdate: (props) => popup.onUpdate(props, isUrgent),
        onKeyDown: (props) => popup.onKeyDown(props),
        onExit: () => popup.onExit(),
      }
    },

    command: ({ editor, range, props: person }) => {
      const nodeType = isUrgent ? 'urgentMention' : 'mention'
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          { type: nodeType, attrs: { id: person.id, label: person.name } },
          { type: 'text', text: ' ' },
        ])
        .run()
    },
  }
}

// ─── Extensions ───

export const PeekMention = Mention.extend({
  name: 'mention',

  addAttributes() {
    return {
      id: { default: null },
      label: { default: null },
    }
  },

  renderHTML({ node }) {
    return [
      'span',
      {
        'data-mention': 'true',
        'data-id': node.attrs.id,
        class:
          'inline-flex items-center rounded-sm px-1 bg-accent-muted text-accent-primary text-sm select-none cursor-default',
      },
      `@${node.attrs.label}`,
    ]
  },

  parseHTML() {
    return [{ tag: 'span[data-mention]' }]
  },
}).configure({
  HTMLAttributes: {},
  suggestion: makeSuggestion(false),
})

export const UrgentMention = Mention.extend({
  name: 'urgentMention',

  addAttributes() {
    return {
      id: { default: null },
      label: { default: null },
    }
  },

  renderHTML({ node }) {
    return [
      'span',
      {
        'data-urgent-mention': 'true',
        'data-id': node.attrs.id,
        class:
          'inline-flex items-center rounded-sm px-1 bg-warning-muted text-warning-default text-sm select-none cursor-default',
      },
      `@${node.attrs.label}`,
    ]
  },

  parseHTML() {
    return [{ tag: 'span[data-urgent-mention]' }]
  },
}).configure({
  HTMLAttributes: {},
  suggestion: {
    ...makeSuggestion(true),
    char: '!@',
  },
})

// ─── Topic mention (#) ───

type TopicListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

const TopicListWrapper = forwardRef<TopicListRef, SuggestionProps>(
  (props, ref) => {
    const [highlight, setHighlight] = useState(0)

    useEffect(() => setHighlight(0), [props.items])

    const selectItem = useCallback(
      (topic: Topic) => props.command(topic),
      [props]
    )

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowDown') {
          setHighlight((h) => Math.min(h + 1, props.items.length - 1))
          return true
        }
        if (event.key === 'ArrowUp') {
          setHighlight((h) => Math.max(h - 1, 0))
          return true
        }
        if (event.key === 'Enter') {
          const topic = props.items[highlight]
          if (topic) selectItem(topic)
          return true
        }
        return false
      },
    }))

    if (props.items.length === 0) return null

    return (
      <TopicMenu
        topics={props.items}
        highlight={highlight}
        onSelect={selectItem}
        onHighlightChange={setHighlight}
      />
    )
  }
)
TopicListWrapper.displayName = 'TopicListWrapper'

class TopicSuggestionPopup {
  component: ReactRenderer<TopicListRef> | null = null
  container: HTMLDivElement | null = null

  onStart(props: SuggestionProps) {
    _openCount++
    this.component = new ReactRenderer(TopicListWrapper, {
      props,
      editor: props.editor,
    })
    this.container = document.createElement('div')
    this.container.style.position = 'fixed'
    this.container.style.zIndex = '50'
    document.body.appendChild(this.container)
    this.container.appendChild(this.component.element)
    this.updatePosition(props)
  }

  onUpdate(props: SuggestionProps) {
    this.component?.updateProps(props)
    this.updatePosition(props)
  }

  onKeyDown(props: { event: KeyboardEvent }) {
    if (props.event.key === 'Escape') {
      this.onExit()
      return true
    }
    return this.component?.ref?.onKeyDown(props) ?? false
  }

  onExit() {
    _openCount = Math.max(0, _openCount - 1)
    _lastCloseTime = Date.now()
    this.component?.destroy()
    this.container?.remove()
    this.component = null
    this.container = null
  }

  private updatePosition(props: SuggestionProps) {
    if (!this.container || !props.clientRect) return
    const rect = (props.clientRect as () => DOMRect)()
    if (!rect) return
    this.container.style.left = `${rect.left}px`
    this.container.style.bottom = `${window.innerHeight - rect.top + 8}px`
    this.container.style.top = ''
  }
}

function TopicMentionView({ node }: NodeViewProps) {
  const { label, isPrivate, isResolved } = node.attrs
  return (
    <NodeViewWrapper as="span" className="inline-flex items-center gap-1 rounded-sm px-1 bg-bg-active text-text-primary text-sm font-normal select-none cursor-default" style={{ verticalAlign: 'text-bottom', height: '1.4em' }}>
      <span className="relative inline-flex items-center justify-center w-4 h-4 shrink-0">
        {isResolved ? (
          <IconCircleCheck size={16} stroke={1.5} className="text-success-default" />
        ) : (
          <IconCircleDashed size={16} stroke={1.5} className="text-text-secondary" />
        )}
        {isPrivate && (
          <span className="absolute left-[9px] top-[7px] bg-bg-active rounded-full p-[0.5px]">
            <IconLockFilled size={8} className="text-text-primary" />
          </span>
        )}
      </span>
      <span>{label}</span>
    </NodeViewWrapper>
  )
}

export const TopicMention = Mention.extend({
  name: 'topicMention',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: { default: null },
      label: { default: null },
      isPrivate: { default: false },
      isResolved: { default: false },
    }
  },

  renderHTML({ node }) {
    return [
      'span',
      {
        'data-topic-mention': 'true',
        'data-id': node.attrs.id,
        class:
          'inline-flex items-center gap-1 rounded-sm px-1 bg-bg-active text-text-primary text-sm select-none cursor-default',
      },
      `#${node.attrs.label}`,
    ]
  },

  parseHTML() {
    return [{ tag: 'span[data-topic-mention]' }]
  },

  addNodeView() {
    return ReactNodeViewRenderer(TopicMentionView, { as: 'span' })
  },
}).configure({
  HTMLAttributes: {},
  suggestion: {
    char: '#',
    items: ({ query }: { query: string }) =>
      TOPICS.filter((t) =>
        query === '' || t.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6),

    render: () => {
      const popup = new TopicSuggestionPopup()
      return {
        onStart: (props: SuggestionProps) => popup.onStart(props),
        onUpdate: (props: SuggestionProps) => popup.onUpdate(props),
        onKeyDown: (props: { event: KeyboardEvent }) => popup.onKeyDown(props),
        onExit: () => popup.onExit(),
      }
    },

    command: ({ editor, range, props: topic }: any) => {
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: 'topicMention',
            attrs: {
              id: topic.id,
              label: topic.title,
              isPrivate: topic.isPrivate,
              isResolved: topic.isResolved,
            },
          },
          { type: 'text', text: ' ' },
        ])
        .run()
    },
  },
})
