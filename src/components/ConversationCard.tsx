import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { PeekMention, UrgentMention, TopicMention, FileMention, isSuggestionActive } from '@/extensions/mention'
import { ResolutionBlock, extractResolution } from '@/extensions/resolution'
import {
  IconMessage2,
  IconAlertSquareRounded,
  IconChecks,
  IconArrowNarrowRight,
  IconCircleDashed,
  IconCircleCheck,
  IconLockFilled,
  IconPaperclip,
  IconSquareForbid2,
  IconBrandGithub,
  IconFile,
  IconFileTypePdf,
  IconPhoto,
  IconTable,
  IconPresentation,
} from '@tabler/icons-react'
import figmaIcon from '@/assets/figma icon.svg'
import linearIcon from '@/assets/linear icon.svg'
import { IconButton } from './ui/IconButton'
import { Avatar } from './ui/Avatar'
import { Chip } from './ui/Chip'
import { Reaction as ReactionPill } from './ui/Reaction'
import { TopicState } from './ui/TopicState'
import { ConversationQuickMenu } from './ConversationQuickMenu'
import { ConversationMoreMenu } from './ConversationMoreMenu'
import ReactionPicker from './ReactionPicker'
import { ResolveDialog } from './ResolveDialog'
import { CreateTopicDialog } from './CreateTopicDialog'
import { PEOPLE } from '@/data/peopleData'
import { TOPICS, type ReactionData } from '@/data/topicData'
import { APP_FILES, DOCUMENT_FILES } from '@/data/filesData'
import { cn } from '@/lib/utils'

// Build an exact-name regex from PEOPLE so we never over-match into surrounding text.
// Longest names first to avoid partial shadowing (e.g. "Bob" before "Bob Smith").
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

/** Parse inline content (mentions + topic refs + text) into Tiptap JSON nodes */
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
        content.push({
          type: 'topicMention',
          attrs: {
            id: topic.id,
            label: title,
            isPrivate: topic.isPrivate,
            isResolved: topic.isResolved,
          },
        })
      } else {
        const appFile = APP_FILES.find((f) => f.title === title)
        const docFile = DOCUMENT_FILES.find((f) => f.title === title)
        const file = appFile ?? docFile
        content.push({
          type: 'fileMention',
          attrs: {
            id: file?.id ?? title,
            label: title,
            app: appFile?.app ?? docFile?.docType ?? '',
            subtitle: file?.subtitle ?? '',
          },
        })
      }
    } else {
      content.push({ type: 'text', text: part })
    }
  }
  return content
}

/** Converts plain-text body to Tiptap JSON content for pre-populating the edit editor. */
function textToTiptapContent(text: string) {
  const lines = text.split('\n')
  const docContent: Record<string, unknown>[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Bullet list
    if (/^[-•]\s/.test(line)) {
      const items: Record<string, unknown>[] = []
      while (i < lines.length && /^[-•]\s/.test(lines[i])) {
        const itemText = lines[i].replace(/^[-•]\s/, '')
        items.push({
          type: 'listItem',
          content: [{ type: 'paragraph', content: parseInlineContent(itemText) }],
        })
        i++
      }
      docContent.push({ type: 'bulletList', content: items })
      continue
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: Record<string, unknown>[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const itemText = lines[i].replace(/^\d+\.\s/, '')
        items.push({
          type: 'listItem',
          content: [{ type: 'paragraph', content: parseInlineContent(itemText) }],
        })
        i++
      }
      docContent.push({ type: 'orderedList', content: items })
      continue
    }

    // Regular paragraph
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
    if (child.type.name === 'hardBreak') {
      text += '\n'
    } else if (child.type.name === 'mention') {
      text += `@${child.attrs.label}`
    } else if (child.type.name === 'urgentMention') {
      text += `!@${child.attrs.label}`
    } else if (child.type.name === 'topicMention') {
      text += `[${child.attrs.label}] `
    } else if (child.type.name === 'fileMention') {
      text += `[${child.attrs.label}] `
    } else {
      text += child.text ?? ''
    }
  })
  return text
}

/** Serialises a Tiptap editor to plain text. */
function serializeTiptapToText(editor: ReturnType<typeof useEditor>): string {
  if (!editor) return ''
  const lines: string[] = []
  editor.state.doc.forEach((node) => {
    // Skip resolution blocks — consumed by the resolve action
    if (node.type.name === 'resolutionBlock') return
    if (node.type.name === 'paragraph') {
      lines.push(serializeInline(node))
    } else if (node.type.name === 'bulletList') {
      node.forEach((li) => {
        li.forEach((liChild) => {
          if (liChild.type.name === 'paragraph') {
            lines.push(`- ${serializeInline(liChild)}`)
          }
        })
      })
    } else if (node.type.name === 'orderedList') {
      let idx = 1
      node.forEach((li) => {
        li.forEach((liChild) => {
          if (liChild.type.name === 'paragraph') {
            lines.push(`${idx}. ${serializeInline(liChild)}`)
            idx++
          }
        })
      })
    }
  })
  return lines.join('\n').trim()
}

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
                  {topic.isPrivate && (
                    <span className="absolute left-[9px] top-[7px] bg-bg-active rounded-full p-[0.5px]">
                      <IconLockFilled size={8} className="text-text-primary" />
                    </span>
                  )}
                </span>
                <span>{title}</span>
              </span>
            )
          }
          // App or document file
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
      // Split blank lines into separate text segments (paragraph breaks)
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

interface ConversationCardProps {
  authorName: string
  authorAvatarSrc?: string
  timestamp: string
  body: string
  reactions?: ReactionData[]
  replyCount?: number
  hasNewReply?: boolean
  hasNewMessage?: boolean
  isUrgent?: boolean
  isResolved?: boolean
  resolvedBy?: string
  resolutionMessage?: string
  isTopic?: boolean
  topicTitle?: string
  isPrivate?: boolean
  showCreateTopic?: boolean
  onResolvedChange?: (resolved: boolean) => void
  onDelete?: () => void
  isSelected?: boolean
  onReply?: () => void
  onClick?: () => void
  onMore?: () => void
  className?: string
}

export function ConversationCard({
  authorName,
  authorAvatarSrc,
  timestamp,
  body,
  reactions,
  replyCount,
  hasNewReply = false,
  hasNewMessage = false,
  isUrgent = false,
  isResolved: initialResolved = false,
  resolvedBy: initialResolvedBy = '',
  resolutionMessage: initialResolutionMessage = '',
  isTopic: initialIsTopic = false,
  topicTitle: initialTopicTitle = '',
  isPrivate: initialIsPrivate = false,
  showCreateTopic = true,
  onResolvedChange,
  onDelete,
  isSelected = false,
  onReply,
  onClick,
  onMore,
  className,
}: ConversationCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [moreMenuPos, setMoreMenuPos] = useState<{
    top?: number
    bottom?: number
    right: number
  } | null>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  // Reactions
  const [reactionsState, setReactionsState] = useState<ReactionData[]>(reactions ?? [])
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  // Body — mutable after edit
  const [bodyState, setBodyState] = useState(body)

  // Edit mode
  const [isEditing, setIsEditing] = useState(false)
  const [editEmpty, setEditEmpty] = useState(false)
  const [editHasUrgent, setEditHasUrgent] = useState(false)

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
      PeekMention,
      UrgentMention,
      TopicMention,
      FileMention,
      ResolutionBlock,
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
        // Shift+Enter: in list → split item (or exit if empty), else new paragraph
        if (event.key === 'Enter' && event.shiftKey) {
          const ed = editEditorRef.current
          if (!ed) return false
          const { $from } = view.state.selection
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === 'listItem') {
              const listItem = $from.node(d)
              if (listItem.textContent.length === 0) {
                ed.commands.liftListItem('listItem')
              } else {
                ed.commands.splitListItem('listItem')
              }
              return true
            }
          }
          ed.commands.splitBlock()
          return true
        }
        if (event.key === 'Escape') {
          editCancelFnRef.current()
          return true
        }
        return false
      },
    },
    content: '',
    autofocus: false,
    onUpdate({ editor }) {
      const doc = editor.state.doc
      let hasNonParagraph = false
      let hasAtomNode = false
      doc.forEach((node) => {
        if (node.type.name !== 'paragraph') hasNonParagraph = true
      })
      doc.descendants((node) => {
        if (node.isAtom && node.type.name !== 'paragraph') hasAtomNode = true
      })
      const empty = doc.textContent.length === 0 && !hasNonParagraph && !hasAtomNode
      setEditEmpty(empty)
      editEmptyRef.current = empty
      if (empty && doc.childCount > 1) {
        requestAnimationFrame(() => {
          editor.commands.setContent({ type: 'doc', content: [{ type: 'paragraph' }] })
        })
      }
      let urgent = false
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'urgentMention') urgent = true
      })
      setEditHasUrgent(urgent)
    },
  })

  editEditorRef.current = editEditor

  // When entering edit mode, populate with current body text
  useEffect(() => {
    if (!editEditor) return
    if (isEditing) {
      editEditor.commands.setContent(textToTiptapContent(bodyState))
      // Focus and move cursor to end
      setTimeout(() => {
        editEditor.commands.focus('end')
      }, 0)
    } else {
      editEditor.commands.clearContent()
    }
  }, [isEditing, editEditor]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close more menu on click outside (the portal div stops propagation internally)
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

  // Resolved state — sync from parent when prop changes
  const [resolved, setResolved] = useState(initialResolved)
  const [resolvedBy, setResolvedBy] = useState(initialResolvedBy)
  const [resolutionMsg, setResolutionMsg] = useState(initialResolutionMessage)
  const [showResolveDialog, setShowResolveDialog] = useState(false)

  useEffect(() => {
    setResolved(initialResolved)
  }, [initialResolved])

  useEffect(() => {
    setResolvedBy(initialResolvedBy)
  }, [initialResolvedBy])

  useEffect(() => {
    setResolutionMsg(initialResolutionMessage)
  }, [initialResolutionMessage])

  // Topic state
  const [isTopic, setIsTopic] = useState(initialIsTopic)
  const [topicTitle, setTopicTitle] = useState(initialTopicTitle)
  const [topicPrivate, setTopicPrivate] = useState(initialIsPrivate)
  const [showTopicDialog, setShowTopicDialog] = useState(false)
  const [topicDialogPrivacy, setTopicDialogPrivacy] = useState<'private' | 'public'>('private')

  const handleMore = (rect: DOMRect) => {
    // Toggle
    if (showMoreMenu) {
      setShowMoreMenu(false)
      setMoreMenuPos(null)
      return
    }
    const MENU_HEIGHT = 300
    const right = window.innerWidth - rect.right
    if (window.innerHeight - rect.bottom < MENU_HEIGHT) {
      // Not enough space below — anchor bottom of menu to just above the button
      setMoreMenuPos({ bottom: window.innerHeight - rect.top + 4, right })
    } else {
      setMoreMenuPos({ top: rect.bottom + 4, right })
    }
    setShowMoreMenu(true)
    onMore?.()
  }

  const handleResolveConfirm = (message: string) => {
    setResolved(true)
    setResolvedBy('You')
    setResolutionMsg(message)
    setShowResolveDialog(false)
    onResolvedChange?.(true)
  }

  const handleReopen = () => {
    setResolved(false)
    setResolvedBy('')
    setResolutionMsg('')
    setShowMoreMenu(false)
    onResolvedChange?.(false)
  }

  const handleDelete = () => {
    setShowMoreMenu(false)
    onDelete?.()
  }

  const handleEditStart = () => {
    setIsEditing(true)
    setShowMoreMenu(false)
  }

  const handleEditSave = () => {
    if (!editEditor) return
    const trimmed = serializeTiptapToText(editEditor)
    const resolution = extractResolution(editEditor)
    if (trimmed) setBodyState(trimmed)
    if (resolution.hasResolution) {
      setResolved(true)
      setResolvedBy('You')
      setResolutionMsg(resolution.resolutionMessage)
      onResolvedChange?.(true)
    }
    setIsEditing(false)
  }

  const handleEditCancel = () => setIsEditing(false)

  editSaveFnRef.current = handleEditSave
  editCancelFnRef.current = handleEditCancel

  const openCreateTopic = () => {
    setTopicDialogPrivacy('private')
    setShowMoreMenu(false)
    setShowTopicDialog(true)
  }

  const openMakePublic = () => {
    setTopicDialogPrivacy('public')
    setShowMoreMenu(false)
    setShowTopicDialog(true)
  }

  const handleTopicConfirm = (data: { title: string; description: string; privacy: 'private' | 'public' }) => {
    setIsTopic(true)
    setTopicTitle(data.title)
    setTopicPrivate(data.privacy === 'private')
    setShowTopicDialog(false)
  }

  const handleRevertToConversation = () => {
    setIsTopic(false)
    setTopicTitle('')
    setTopicPrivate(false)
    setShowMoreMenu(false)
  }

  const handleReact = (emoji: string) => {
    setReactionsState((prev) => {
      const existing = prev.find((r) => r.emoji === emoji && r.owner === 'yours')
      if (existing) {
        // Toggle off own reaction
        if (existing.count <= 1) return prev.filter((r) => r !== existing)
        return prev.map((r) => r === existing ? { ...r, count: r.count - 1 } : r)
      }
      // Add new reaction
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
            : isSelected
              ? 'bg-bg-selected border border-border-subtle'
              : isHovered
                ? 'bg-bg-hover border border-border-default'
                : 'bg-bg-surface border border-transparent',
          onClick && !isEditing && 'cursor-pointer',
          className
        )}
        onClick={() => { if (!isEditing) onClick?.() }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setShowReactionPicker(false) }}
      >

        {/* ── Topic header — hidden while editing ── */}
        {isTopic && !isEditing && (
          <div className="flex items-start gap-2 px-2 py-3 pb-2">
            <div className="flex flex-col items-center gap-1 w-6 shrink-0">
              <TopicState
                type="topic"
                status={resolved ? 'resolved' : 'unresolved'}
                isPrivate={topicPrivate}
              />
              <div className="w-px bg-border-default flex-1 min-h-[24px]" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="h-4 flex items-center">
                <span className="text-h5 text-text-primary">{topicTitle}</span>
              </div>
              {resolved && (
                <div className="flex items-center gap-2 mt-1 py-1">
                  <IconChecks size={16} stroke={1.5} className="text-success-default shrink-0" />
                  <span className="text-menu text-success-default whitespace-nowrap">
                    {resolvedBy || 'Someone'} resolved
                  </span>
                  {resolutionMsg && (
                    <>
                      <IconArrowNarrowRight size={12} stroke={1.5} className="text-text-primary shrink-0" />
                      <span className="text-menu text-text-primary truncate">{resolutionMsg}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Resolution banner — hidden while editing ── */}
        {!isTopic && resolved && !isEditing && (
          <div className="flex items-center gap-2 px-3 py-2 pb-1">
            <IconChecks size={16} stroke={1.5} className="text-success-default shrink-0" />
            <span className="text-menu text-success-default whitespace-nowrap">
              {resolvedBy || 'Someone'} resolved
            </span>
            {resolutionMsg && (
              <>
                <IconArrowNarrowRight size={12} stroke={1.5} className="text-text-primary shrink-0" />
                <span className="text-menu text-text-primary truncate">{resolutionMsg}</span>
              </>
            )}
          </div>
        )}

        {/* ── Message box ── */}
        {isEditing ? (
          /* Edit layout: avatar + textarea box side by side */
          <div className="p-2">
            <div className="flex items-start gap-2">
              <Avatar size={24} src={authorAvatarSrc} alt={authorName} className="shrink-0 mt-3" />
              <div className="flex-1 min-w-0 bg-bg-inset border border-border-default rounded-lg p-3 flex flex-col gap-4">
                <div className={cn(
                  'relative min-h-[20px] transition-all',
                  editHasUrgent && 'border-l-[4px] border-border-strong pl-2'
                )}>
                  <EditorContent editor={editEditor} />
                  {editEmpty && (
                    <div className="absolute inset-0 pointer-events-none flex items-center text-sm text-text-muted leading-[1.4]">
                      Edit message
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <IconButton aria-label="Attach file">
                      <IconPaperclip size={16} stroke={1.5} />
                    </IconButton>
                    <IconButton aria-label="Snooze">
                      <IconSquareForbid2 size={16} stroke={1.5} />
                    </IconButton>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEditCancel}
                      className="h-6 px-1 text-xs font-medium text-text-primary border border-border-default rounded-md hover:bg-bg-active transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditSave}
                      disabled={editEmpty}
                      className={cn(
                        'h-6 w-12 text-xs font-medium rounded-md transition-colors',
                        editEmpty
                          ? 'bg-bg-disabled text-text-disabled pointer-events-none'
                          : 'bg-accent-primary hover:bg-accent-hover text-accent-muted cursor-pointer'
                      )}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
        /* Normal layout: header + body + reactions + replies */
        <div className={cn('flex flex-col items-start p-2', isTopic && 'pt-0')}>
          {/* Header */}
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2 shrink-0">
              <Avatar size={24} src={authorAvatarSrc} alt={authorName} />
              <span className="text-body-2-strong text-text-primary whitespace-nowrap">{authorName}</span>
              <span className="text-caption text-text-muted whitespace-nowrap">{timestamp}</span>
            </div>
            {hasNewMessage && !isUrgent && <Chip type="brand" label="1 new" />}
            {isUrgent && (
              <Chip
                type="warning"
                label="1 new"
                leadingIcon={<IconAlertSquareRounded size={12} stroke={1.5} />}
              />
            )}
          </div>

          <div className="pl-8 pr-2 pt-1 pb-2 w-full">
            <MessageBody body={bodyState} />
          </div>

          {/* Reactions */}
          {!isEditing && reactionsState.length > 0 && (
            <div className="flex items-center gap-2 pl-8 pt-1 pb-2 w-full">
              {reactionsState.map((r, i) => (
                <ReactionPill key={i} emoji={r.emoji} count={r.count} owner={r.owner} onClick={() => handleReact(r.emoji)} />
              ))}
            </div>
          )}

          {/* Replies */}
          {!isEditing && replyCount != null && replyCount > 0 && (
            <div className="flex items-center gap-2 pl-8 pr-2 py-1.5 w-full">
              <IconMessage2 size={16} stroke={1.5} className="text-text-muted shrink-0" />
              <span className="text-chip text-text-muted">
                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              </span>
              {hasNewReply && !isUrgent && (
                <>
                  <div className="w-0.5 h-0.5 rounded-full bg-text-muted shrink-0" />
                  <Chip type="brand" label="1 new" />
                </>
              )}
              {hasNewReply && isUrgent && (
                <>
                  <div className="w-0.5 h-0.5 rounded-full bg-text-muted shrink-0" />
                  <Chip
                    type="warning"
                    label="1 new"
                    leadingIcon={<IconAlertSquareRounded size={12} stroke={1.5} />}
                  />
                </>
              )}
            </div>
          )}
        </div>
        )}

        {/* ── Quick menu on hover ── */}
        {isHovered && !isEditing && (
          <div className="absolute right-[3px] top-[3px]">
            <ConversationQuickMenu
              isResolved={resolved}
              onReact={() => setShowReactionPicker((v) => !v)}
              onReply={onReply}
              onResolve={() => setShowResolveDialog(true)}
              onReopen={handleReopen}
              onMore={handleMore}
            />
            {showReactionPicker && (
              <div
                className="absolute right-0 bottom-full mb-1 z-50"
                onMouseLeave={() => setShowReactionPicker(false)}
              >
                <ReactionPicker onSelect={handleReact} />
              </div>
            )}
          </div>
        )}

        {/* ── More menu (portalled) ── */}
        {showMoreMenu && moreMenuPos &&
          createPortal(
            <div
              ref={moreMenuRef}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseLeave={() => { setShowMoreMenu(false); setMoreMenuPos(null) }}
              style={{
                position: 'fixed',
                ...(moreMenuPos.top !== undefined ? { top: moreMenuPos.top } : {}),
                ...(moreMenuPos.bottom !== undefined ? { bottom: moreMenuPos.bottom } : {}),
                right: moreMenuPos.right,
                zIndex: 50,
              }}
            >
              <ConversationMoreMenu
                isTopic={isTopic}
                isPrivate={topicPrivate}
                isResolved={resolved}
                showCreateTopic={showCreateTopic}
                onCreateTopic={openCreateTopic}
                onRevertToConversation={handleRevertToConversation}
                onMakePublic={openMakePublic}
                onResolve={() => { setShowMoreMenu(false); setShowResolveDialog(true) }}
                onReopen={handleReopen}
                onEditMessage={!isTopic ? handleEditStart : undefined}
                onDelete={handleDelete}
              />
            </div>,
            document.body
          )}
      </div>

      {showResolveDialog && (
        <ResolveDialog
          onResolve={handleResolveConfirm}
          onCancel={() => setShowResolveDialog(false)}
        />
      )}

      {showTopicDialog && (
        <CreateTopicDialog
          defaultTitle={isTopic ? topicTitle : ''}
          defaultPrivacy={topicDialogPrivacy}
          confirmLabel={isTopic && topicDialogPrivacy === 'public' ? 'Publish' : 'Create topic'}
          onConfirm={handleTopicConfirm}
          onCancel={() => setShowTopicDialog(false)}
        />
      )}
    </>
  )
}
