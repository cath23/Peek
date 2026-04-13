import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { PeekMention, UrgentMention, TopicMention, FileMention, isSuggestionActive } from '@/extensions/mention'
import { ResolutionBlock, extractResolution } from '@/extensions/resolution'
import { HighlightTag, extractHighlightType } from '@/extensions/highlight'
import {
  IconMoodPlus,
  IconDotsVertical,
  IconPaperclip,
  IconSquareForbid2,
  IconCircleDashed,
  IconCircleCheck,
  IconBrandGithub,
  IconFile,
  IconFileTypePdf,
  IconPhoto,
  IconTable,
  IconPresentation,
  IconX,
} from '@tabler/icons-react'
import figmaIcon from '@/assets/figma icon.svg'
import linearIcon from '@/assets/linear icon.svg'
import { IconButton } from './ui/IconButton'
import { Avatar } from './ui/Avatar'
import ReactionPicker from './ReactionPicker'
import { Reaction as ReactionPill } from './ui/Reaction'
import { Divider } from './ui/Divider'
import { PEOPLE } from '@/data/peopleData'
import { TOPICS, type ReactionData } from '@/data/topicData'
import { APP_FILES, DOCUMENT_FILES } from '@/data/filesData'
import { cn } from '@/lib/utils'
import { HighlightPill, HighlightSwatch } from './ui/HighlightPill'
import { HIGHLIGHT_META, type HighlightType } from '@/data/topicData'

// ── Inline rendering (shared with ConversationCard) ──

const _escapedNames = PEOPLE
  .map((p) => p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .sort((a, b) => b.length - a.length)
  .join('|')
const _escapedBracketTitles = [
  ...TOPICS.map((t) => t.title),
  ...APP_FILES.map((f) => f.title),
  ...DOCUMENT_FILES.map((f) => f.title),
]
  .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .sort((a, b) => b.length - a.length)
  .join('|')
const MENTION_RE = new RegExp(`((?:!@|@)(?:${_escapedNames})|\\[(?:${_escapedBracketTitles})\\])`, 'g')

function renderWithMentions(text: string): React.ReactNode {
  const parts = text.split(MENTION_RE)
  if (parts.length === 1) return text
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('[') && part.endsWith(']') && part.length > 2) {
          const title = part.slice(1, -1)
          const topic = TOPICS.find((t) => t.title === title)
          if (topic) {
            return (
              <span key={i} className="inline-flex items-center gap-1 rounded-sm px-1 mx-0.5 bg-bg-active text-text-primary text-sm font-normal select-none" style={{ verticalAlign: 'text-bottom', height: '1.4em' }}>
                <span className="relative inline-flex items-center justify-center w-4 h-4 shrink-0">
                  {topic.isResolved ? (
                    <IconCircleCheck size={16} stroke={1.5} className="text-success-default" />
                  ) : (
                    <IconCircleDashed size={16} stroke={1.5} className="text-text-secondary" />
                  )}
                </span>
                <span>{title}</span>
              </span>
            )
          }
          const appFile = APP_FILES.find((f) => f.title === title)
          const docFile = DOCUMENT_FILES.find((f) => f.title === title)
          const fileApp = appFile?.app ?? docFile?.docType ?? ''
          const svgIcons: Record<string, string> = { figma: figmaIcon, linear: linearIcon }
          const tablerIcons: Record<string, React.FC<{ size: number; stroke: number; className?: string }>> = {
            github: IconBrandGithub, pdf: IconFileTypePdf, image: IconPhoto,
            spreadsheet: IconTable, presentation: IconPresentation,
          }
          const svgSrc = svgIcons[fileApp]
          const TablerIcon = tablerIcons[fileApp] ?? IconFile
          return (
            <span key={i} className="inline-flex items-center gap-1 rounded-sm px-1 mx-0.5 bg-bg-active text-text-primary text-sm font-normal select-none" style={{ verticalAlign: 'text-bottom', height: '1.4em' }}>
              {svgSrc ? (
                <img src={svgSrc} width={14} height={14} alt={fileApp} className="rounded-[2px] shrink-0" />
              ) : (
                <span className="flex items-center justify-center w-4 h-4 shrink-0 text-text-secondary">
                  <TablerIcon size={14} stroke={1.5} />
                </span>
              )}
              <span>{title}</span>
            </span>
          )
        }
        if (/^(?:!@|@)/.test(part) && part.length > 1) {
          return (
            <span key={i} className="rounded-sm px-1 mx-0.5 bg-bg-active text-text-primary text-sm font-normal select-none">
              {part}
            </span>
          )
        }
        return part || null
      })}
    </>
  )
}

type BodySegment =
  | { type: 'text'; lines: string[] }
  | { type: 'bullet'; items: string[] }
  | { type: 'numbered'; items: string[] }

function parseBodySegments(body: string): BodySegment[] {
  const lines = body.split('\n')
  const segments: BodySegment[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^[-•]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-•]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-•]\s/, ''))
        i++
      }
      segments.push({ type: 'bullet', items })
    } else if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      segments.push({ type: 'numbered', items })
    } else {
      const textLines: string[] = []
      while (i < lines.length && !/^[-•]\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i])) {
        textLines.push(lines[i])
        i++
      }
      let chunk: string[] = []
      for (const l of textLines) {
        if (l === '') {
          if (chunk.length > 0) { segments.push({ type: 'text', lines: chunk }); chunk = [] }
        } else {
          chunk.push(l)
        }
      }
      if (chunk.length > 0) segments.push({ type: 'text', lines: chunk })
    }
  }
  return segments
}

function MessageBody({ body }: { body: string }) {
  const segments = parseBodySegments(body)
  return (
    <div className="flex flex-col gap-1 text-sm text-text-secondary leading-[1.4]">
      {segments.map((seg, i) => {
        if (seg.type === 'bullet') {
          return (
            <ul key={i} className="flex flex-col gap-1">
              {seg.items.map((item, j) => (
                <li key={j} className="flex gap-2">
                  <span className="shrink-0 mt-px">•</span>
                  <span>{renderWithMentions(item)}</span>
                </li>
              ))}
            </ul>
          )
        }
        if (seg.type === 'numbered') {
          return (
            <ol key={i} className="flex flex-col gap-1">
              {seg.items.map((item, j) => (
                <li key={j} className="flex gap-2">
                  <span className="shrink-0 text-text-muted">{j + 1}.</span>
                  <span>{renderWithMentions(item)}</span>
                </li>
              ))}
            </ol>
          )
        }
        return (
          <p key={i}>
            {seg.lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {renderWithMentions(line)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

// ── Edit-mode helpers ──

function parseInlineContent(line: string): Record<string, unknown>[] {
  const parts = line.split(MENTION_RE)
  const content: Record<string, unknown>[] = []
  for (const part of parts) {
    if (!part) continue
    if (part.startsWith('!@') && part.length > 2) {
      const name = part.slice(2)
      const person = PEOPLE.find((p) => p.name === name)
      content.push({ type: 'urgentMention', attrs: { id: person?.id ?? name, label: name } })
    } else if (part.startsWith('@') && part.length > 1) {
      const name = part.slice(1)
      const person = PEOPLE.find((p) => p.name === name)
      content.push({ type: 'mention', attrs: { id: person?.id ?? name, label: name } })
    } else if (part.startsWith('[') && part.endsWith(']') && part.length > 2) {
      const title = part.slice(1, -1)
      const topic = TOPICS.find((t) => t.title === title)
      if (topic) {
        content.push({ type: 'topicMention', attrs: { id: topic.id, label: title, isResolved: topic.isResolved } })
      } else {
        const appFile = APP_FILES.find((f) => f.title === title)
        const docFile = DOCUMENT_FILES.find((f) => f.title === title)
        const file = appFile ?? docFile
        content.push({ type: 'fileMention', attrs: { id: file?.id ?? title, label: title, app: appFile?.app ?? docFile?.docType ?? '', subtitle: file?.subtitle ?? '' } })
      }
    } else {
      content.push({ type: 'text', text: part })
    }
  }
  return content
}

function textToTiptapContent(text: string) {
  const lines = text.split('\n')
  const docContent: Record<string, unknown>[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^[-•]\s/.test(line)) {
      const items: Record<string, unknown>[] = []
      while (i < lines.length && /^[-•]\s/.test(lines[i])) {
        items.push({ type: 'listItem', content: [{ type: 'paragraph', content: parseInlineContent(lines[i].replace(/^[-•]\s/, '')) }] })
        i++
      }
      docContent.push({ type: 'bulletList', content: items })
      continue
    }
    if (/^\d+\.\s/.test(line)) {
      const items: Record<string, unknown>[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push({ type: 'listItem', content: [{ type: 'paragraph', content: parseInlineContent(lines[i].replace(/^\d+\.\s/, '')) }] })
        i++
      }
      docContent.push({ type: 'orderedList', content: items })
      continue
    }
    if (line.length === 0) {
      docContent.push({ type: 'paragraph', content: [] })
    } else {
      docContent.push({ type: 'paragraph', content: parseInlineContent(line) })
    }
    i++
  }
  return { type: 'doc' as const, content: docContent }
}

function serializeInline(node: { forEach: (cb: (child: { type: { name: string }; attrs: Record<string, string>; text?: string }) => void) => void }): string {
  let text = ''
  node.forEach((child) => {
    if (child.type.name === 'highlightTag') { /* skip */ }
    else if (child.type.name === 'hardBreak') text += '\n'
    else if (child.type.name === 'mention') text += `@${child.attrs.label}`
    else if (child.type.name === 'urgentMention') text += `!@${child.attrs.label}`
    else if (child.type.name === 'topicMention') text += `[${child.attrs.label}] `
    else if (child.type.name === 'fileMention') text += `[${child.attrs.label}] `
    else text += child.text ?? ''
  })
  return text
}

function serializeTiptapToText(editor: ReturnType<typeof useEditor>): string {
  if (!editor) return ''
  const lines: string[] = []
  editor.state.doc.forEach((node) => {
    if (node.type.name === 'resolutionBlock') return
    if (node.type.name === 'paragraph') {
      lines.push(serializeInline(node))
    } else if (node.type.name === 'bulletList') {
      node.forEach((li) => { li.forEach((liChild) => { if (liChild.type.name === 'paragraph') lines.push(`- ${serializeInline(liChild)}`) }) })
    } else if (node.type.name === 'orderedList') {
      let idx = 1
      node.forEach((li) => { li.forEach((liChild) => { if (liChild.type.name === 'paragraph') { lines.push(`${idx}. ${serializeInline(liChild)}`); idx++ } }) })
    }
  })
  return lines.join('\n').trim()
}

// ── Reply More Menu ──

function ReplyMoreMenu({ onEdit, onDelete, currentHighlight, onHighlight, className }: {
  onEdit?: () => void
  onDelete?: () => void
  currentHighlight?: HighlightType
  onHighlight?: (type: HighlightType | undefined) => void
  className?: string
}) {
  const [showHighlightSub, setShowHighlightSub] = useState(false)
  const [subOnLeft, setSubOnLeft] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const openSub = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setShowHighlightSub(true)
  }

  const closeSub = () => {
    closeTimer.current = setTimeout(() => setShowHighlightSub(false), 150)
  }

  // Measure whether the submenu fits to the right; if not, flip to left
  useEffect(() => {
    if (!showHighlightSub || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const subWidth = 160 + 8
    setSubOnLeft(rect.right + subWidth > window.innerWidth)
  }, [showHighlightSub])

  return (
    <div className={cn('bg-bg-elevated border border-border-default rounded-lg shadow-lg w-[180px] p-2 flex flex-col gap-2', className)}>
      <div className="flex flex-col">
        <div
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-bg-hover w-full"
          onClick={onEdit}
        >
          <span className="flex-1 text-sm text-text-secondary">Edit message</span>
        </div>
        {onHighlight && (
          <div className="relative">
            <div
              ref={triggerRef}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-bg-hover w-full"
              onMouseEnter={openSub}
              onMouseLeave={closeSub}
            >
              <span className="flex-1 text-sm text-text-secondary">
                {currentHighlight ? 'Change highlight' : 'Mark as Highlight'}
              </span>
              <span className="text-text-muted text-xs">›</span>
            </div>
            {showHighlightSub && (
              <div
                className={cn(
                  'absolute top-0 bg-bg-elevated border border-border-default rounded-lg shadow-lg w-[160px] p-2 z-50',
                  subOnLeft ? 'right-full mr-1' : 'left-full ml-1'
                )}
                onMouseEnter={openSub}
                onMouseLeave={closeSub}
              >
                {(['insight', 'concern', 'conclusion', 'question', 'summary'] as HighlightType[]).map((type) => (
                  <div
                    key={type}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-bg-hover',
                      currentHighlight === type && 'bg-bg-hover'
                    )}
                    onClick={() => onHighlight(type)}
                  >
                    <HighlightSwatch type={type} />
                    <span className="text-sm text-text-secondary">{HIGHLIGHT_META[type].label}</span>
                  </div>
                ))}
                {currentHighlight && (
                  <>
                    <div className="h-px bg-border-subtle mx-1 my-1" />
                    <div
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-bg-hover"
                      onClick={() => onHighlight(undefined)}
                    >
                      <IconX size={14} stroke={1.5} className="text-text-muted shrink-0" />
                      <span className="text-sm text-text-secondary">Remove</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <Divider className="mx-0" />
      <div
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-bg-hover w-full"
        onClick={onDelete}
      >
        <span className="flex-1 text-sm text-error-default">Delete</span>
      </div>
    </div>
  )
}

// ── ThreadReplyCard ──

interface ThreadReplyCardProps {
  authorName: string
  authorAvatarSrc?: string
  timestamp: string
  body: string
  reactions?: ReactionData[]
  highlightType?: HighlightType
  onHighlightChange?: (type: HighlightType | undefined) => void
  onDelete?: () => void
  onBodyChange?: (newBody: string) => void
  className?: string
}

export function ThreadReplyCard({
  authorName,
  authorAvatarSrc,
  timestamp,
  body,
  reactions,
  highlightType,
  onHighlightChange,
  onDelete,
  onBodyChange,
  className,
}: ThreadReplyCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [moreMenuPos, setMoreMenuPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const moreButtonRef = useRef<HTMLDivElement>(null)

  const [reactionsState, setReactionsState] = useState<ReactionData[]>(reactions ?? [])
  const [highlightState, setHighlightState] = useState<HighlightType | undefined>(highlightType)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [reactionPickerPos, setReactionPickerPos] = useState<{ top: number; right: number } | null>(null)
  const reactButtonRef = useRef<HTMLDivElement>(null)
  const reactionPickerRef = useRef<HTMLDivElement>(null)

  const [bodyState, setBodyState] = useState(body)
  // Sync body from prop when it changes externally
  useEffect(() => { setBodyState(body) }, [body])
  useEffect(() => { setHighlightState(highlightType) }, [highlightType])
  const [isEditing, setIsEditing] = useState(false)
  const [editEmpty, setEditEmpty] = useState(false)
  const [editHasUrgent, setEditHasUrgent] = useState(false)
  const [editHasHighlight, setEditHasHighlight] = useState(false)

  const editSaveFnRef = useRef<() => void>(() => {})
  const editCancelFnRef = useRef<() => void>(() => {})
  const editEmptyRef = useRef(true)
  const editEditorRef = useRef<ReturnType<typeof useEditor>>(null)

  const editEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false, italic: false, strike: false, code: false,
        blockquote: false, codeBlock: false, horizontalRule: false, heading: false,
        hardBreak: false, trailingNode: false,
      }),
      PeekMention, UrgentMention, TopicMention, FileMention, ResolutionBlock, HighlightTag,
    ],
    editorProps: {
      attributes: {
        class: 'outline-none w-full bg-transparent text-sm text-text-primary leading-[1.4] break-words min-h-[20px]',
        style: 'caret-color: var(--text-primary)',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          if (isSuggestionActive()) return false
          if (!editEmptyRef.current) editSaveFnRef.current()
          return true
        }
        if (event.key === 'Enter' && event.shiftKey) {
          const ed = editEditorRef.current
          if (!ed) return false
          const { $from } = view.state.selection
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === 'listItem') {
              if ($from.node(d).textContent.length === 0) ed.commands.liftListItem('listItem')
              else ed.commands.splitListItem('listItem')
              return true
            }
          }
          ed.commands.splitBlock()
          return true
        }
        if (event.key === 'Escape') { editCancelFnRef.current(); return true }
        return false
      },
    },
    content: '',
    autofocus: false,
    onUpdate({ editor }) {
      const doc = editor.state.doc
      let hasNonParagraph = false
      let hasAtomNode = false
      doc.forEach((node) => { if (node.type.name !== 'paragraph') hasNonParagraph = true })
      doc.descendants((node) => { if (node.isAtom && node.type.name !== 'paragraph') hasAtomNode = true })
      const empty = doc.textContent.length === 0 && !hasNonParagraph && !hasAtomNode
      setEditEmpty(empty)
      editEmptyRef.current = empty
      if (empty && doc.childCount > 1) {
        requestAnimationFrame(() => { editor.commands.setContent({ type: 'doc', content: [{ type: 'paragraph' }] }) })
      }
      let urgent = false
      let highlight = false
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'urgentMention') urgent = true
        if (node.type.name === 'highlightTag') highlight = true
      })
      setEditHasUrgent(urgent)
      setEditHasHighlight(highlight)
    },
  })

  editEditorRef.current = editEditor

  useEffect(() => {
    if (!editEditor) return
    if (isEditing) {
      const content = textToTiptapContent(bodyState)
      // If message has a highlight, prepend the tag to the first paragraph
      if (highlightState && content.content && content.content.length > 0) {
        const first = content.content[0]
        if (first.type === 'paragraph') {
          const existing = (first.content ?? []) as Record<string, unknown>[]
          first.content = [
            { type: 'highlightTag', attrs: { highlightType: highlightState } },
            { type: 'text', text: ' ' },
            ...existing,
          ]
        }
      }
      editEditor.commands.setContent(content)
      setTimeout(() => editEditor.commands.focus('end'), 0)
    } else {
      editEditor.commands.clearContent()
    }
  }, [isEditing, editEditor]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showMoreMenu) return
    const close = (e: MouseEvent) => {
      if (moreMenuRef.current?.contains(e.target as Node)) return
      setShowMoreMenu(false)
      setMoreMenuPos(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [showMoreMenu])

  const handleMore = () => {
    if (showMoreMenu) { setShowMoreMenu(false); setMoreMenuPos(null); return }
    const el = moreButtonRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const right = window.innerWidth - rect.right
    if (window.innerHeight - rect.bottom < 200) {
      setMoreMenuPos({ bottom: window.innerHeight - rect.top + 4, right })
    } else {
      setMoreMenuPos({ top: rect.bottom + 4, right })
    }
    setShowMoreMenu(true)
  }

  const handleEditStart = () => { setIsEditing(true); setShowMoreMenu(false) }

  const handleEditSave = () => {
    if (!editEditor) return
    const trimmed = serializeTiptapToText(editEditor)
    if (trimmed) {
      setBodyState(trimmed)
      onBodyChange?.(trimmed)
    }
    // Preserve highlight type from edit
    const hl = extractHighlightType(editEditor)
    setHighlightState(hl)
    onHighlightChange?.(hl)
    setIsEditing(false)
  }

  const handleEditCancel = () => setIsEditing(false)

  editSaveFnRef.current = handleEditSave
  editCancelFnRef.current = handleEditCancel

  const handleDelete = () => { setShowMoreMenu(false); onDelete?.() }

  const handleHighlightChange = (type: HighlightType | undefined) => {
    setHighlightState(type)
    onHighlightChange?.(type)
    setShowMoreMenu(false)
    setMoreMenuPos(null)
    setIsHovered(false)
  }

  const openReactionPicker = () => {
    if (showReactionPicker) {
      setShowReactionPicker(false)
      setReactionPickerPos(null)
      return
    }
    const btn = reactButtonRef.current?.getBoundingClientRect()
    if (btn) {
      setReactionPickerPos({ top: btn.top - 4, right: window.innerWidth - btn.right })
      setShowReactionPicker(true)
    }
  }

  // Close reaction picker on outside click
  useEffect(() => {
    if (!showReactionPicker) return
    const close = (e: MouseEvent) => {
      if (reactionPickerRef.current?.contains(e.target as Node)) return
      if (reactButtonRef.current?.contains(e.target as Node)) return
      setShowReactionPicker(false)
      setReactionPickerPos(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [showReactionPicker])

  const handleReact = (emoji: string) => {
    setReactionsState((prev) => {
      const existing = prev.find((r) => r.emoji === emoji && r.owner === 'yours')
      if (existing) {
        if (existing.count <= 1) return prev.filter((r) => r !== existing)
        return prev.map((r) => r === existing ? { ...r, count: r.count - 1 } : r)
      }
      const othersExisting = prev.find((r) => r.emoji === emoji && r.owner === 'others')
      if (othersExisting) {
        return prev.map((r) => r === othersExisting ? { ...r, count: r.count + 1, owner: 'yours' as const } : r)
      }
      return [...prev, { emoji, count: 1, owner: 'yours' as const }]
    })
    setShowReactionPicker(false)
  }

  return (
    <>
      <div
        className={cn(
          'relative rounded-lg transition-colors',
          isEditing
            ? 'bg-bg-selected border border-accent-primary'
            : isHovered
              ? 'bg-bg-hover border border-border-default'
              : 'bg-bg-surface border border-transparent',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          if (showReactionPicker || showMoreMenu) return
          setIsHovered(false)
        }}
      >
        {isEditing ? (
          <div className="p-2">
            <div className="flex items-start gap-2">
              <Avatar size={24} src={authorAvatarSrc} alt={authorName} className="shrink-0 mt-3" />
              <div className="flex-1 min-w-0 bg-bg-inset border border-border-default rounded-lg p-3 flex flex-col gap-4">
                <div className={cn('relative min-h-[20px] transition-all', (editHasUrgent || editHasHighlight) && 'border-l-[4px] border-border-strong pl-2')}>
                  <EditorContent editor={editEditor} />
                  {editEmpty && (
                    <div className="absolute inset-0 pointer-events-none flex items-center text-sm text-text-muted leading-[1.4]">
                      Edit message
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <IconButton aria-label="Attach file"><IconPaperclip size={16} stroke={1.5} /></IconButton>
                    <IconButton aria-label="Snooze"><IconSquareForbid2 size={16} stroke={1.5} /></IconButton>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleEditCancel} className="h-6 px-1 text-xs font-medium text-text-primary border border-border-default rounded-md hover:bg-bg-active transition-colors cursor-pointer">Cancel</button>
                    <button onClick={handleEditSave} disabled={editEmpty} className={cn('h-6 w-12 text-xs font-medium rounded-md transition-colors', editEmpty ? 'bg-bg-disabled text-text-disabled pointer-events-none' : 'bg-accent-primary hover:bg-accent-hover text-accent-muted cursor-pointer')}>Save</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start p-2">
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2 shrink-0">
                <Avatar size={24} src={authorAvatarSrc} alt={authorName} />
                <span className="text-body-2-strong text-text-primary whitespace-nowrap">{authorName}</span>
                <span className="text-caption text-text-muted whitespace-nowrap">{timestamp}</span>
                {highlightState && <HighlightPill type={highlightState} />}
              </div>
            </div>
            <div className="pl-8 pr-2 pt-1 pb-2 w-full overflow-hidden break-words">
              <MessageBody body={bodyState} />
            </div>
            {reactionsState.length > 0 && (
              <div className="flex items-center gap-2 pl-8 pt-1 pb-2 w-full">
                {reactionsState.map((r, i) => (
                  <ReactionPill key={i} emoji={r.emoji} count={r.count} owner={r.owner} onClick={() => handleReact(r.emoji)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick menu — only react + more */}
        {isHovered && !isEditing && (
          <div className="absolute right-[3px] top-[3px]">
            <div className="bg-bg-elevated border border-border-subtle rounded-sm shadow-sm flex items-start gap-1 p-1">
              <div ref={reactButtonRef} className="inline-flex">
                <IconButton tooltip="React" aria-label="React" onClick={openReactionPicker}>
                  <IconMoodPlus size={16} stroke={1.5} />
                </IconButton>
              </div>
              <div ref={moreButtonRef} className="inline-flex">
                <IconButton tooltip="More actions" aria-label="More actions" onClick={handleMore}>
                  <IconDotsVertical size={16} stroke={1.5} />
                </IconButton>
              </div>
            </div>
          </div>
        )}

        {/* More menu (portalled) */}
        {showMoreMenu && moreMenuPos &&
          createPortal(
            <div
              ref={moreMenuRef}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseLeave={() => { setShowMoreMenu(false); setMoreMenuPos(null); setIsHovered(false) }}
              style={{
                position: 'fixed',
                ...(moreMenuPos.top !== undefined ? { top: moreMenuPos.top } : {}),
                ...(moreMenuPos.bottom !== undefined ? { bottom: moreMenuPos.bottom } : {}),
                right: moreMenuPos.right,
                zIndex: 50,
              }}
            >
              <ReplyMoreMenu
                onEdit={handleEditStart}
                onDelete={handleDelete}
                currentHighlight={highlightState}
                onHighlight={handleHighlightChange}
              />
            </div>,
            document.body
          )}
      </div>

      {/* Reaction picker (portalled) */}
      {showReactionPicker && reactionPickerPos &&
        createPortal(
          <div
            ref={reactionPickerRef}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseLeave={() => { setShowReactionPicker(false); setReactionPickerPos(null); setIsHovered(false) }}
            style={{
              position: 'fixed',
              top: reactionPickerPos.top,
              right: reactionPickerPos.right,
              transform: 'translateY(-100%)',
              zIndex: 50,
            }}
          >
            <ReactionPicker onSelect={handleReact} />
          </div>,
          document.body
        )}
    </>
  )
}
