import { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { PeekMention, UrgentMention, TopicMention, isSuggestionActive } from '@/extensions/mention'
import { IconPaperclip, IconSquareForbid2, IconArrowUp } from '@tabler/icons-react'
import { IconButton } from './IconButton'
import { cn } from '@/lib/utils'

interface ComposeBoxProps {
  onSend?: (value: string) => void
  className?: string
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
      text += `#${child.attrs.label}`
    } else {
      text += child.text ?? ''
    }
  })
  return text
}

function serializeToText(editor: ReturnType<typeof useEditor>): string {
  if (!editor) return ''
  const lines: string[] = []
  editor.state.doc.forEach((node) => {
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

export function ComposeBox({ onSend, className }: ComposeBoxProps) {
  const [isEmpty, setIsEmpty] = useState(true)
  const [hasUrgent, setHasUrgent] = useState(false)

  const sendFnRef = useRef(onSend)
  sendFnRef.current = onSend

  const editorRef = useRef<ReturnType<typeof useEditor>>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false, italic: false, strike: false, code: false,
        blockquote: false, codeBlock: false, horizontalRule: false, heading: false,
        hardBreak: false, trailingNode: false,
      }),
      PeekMention,
      UrgentMention,
      TopicMention,
    ],
    editorProps: {
      attributes: {
        class: 'outline-none w-full bg-transparent text-sm text-text-primary leading-[1.4] break-words min-h-[20px]',
        style: 'caret-color: var(--text-primary)',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          if (isSuggestionActive()) return false
          const text = serializeToText(editorRef.current)
          if (text) {
            sendFnRef.current?.(text)
            editorRef.current?.commands.clearContent(true)
          }
          return true
        }
        // Shift+Enter: in list → split item (or exit if empty), else new paragraph
        if (event.key === 'Enter' && event.shiftKey) {
          const ed = editorRef.current
          if (!ed) return false
          const { $from } = view.state.selection
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === 'listItem') {
              // Empty list item → exit the list
              const listItem = $from.node(d)
              const isEmpty = listItem.textContent.length === 0
              if (isEmpty) {
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
        return false
      },
    },
    content: '',
    autofocus: true,
    onUpdate({ editor }) {
      const doc = editor.state.doc
      let hasNonParagraph = false
      doc.forEach((node) => {
        if (node.type.name !== 'paragraph') hasNonParagraph = true
      })
      const empty = doc.textContent.length === 0 && !hasNonParagraph
      setIsEmpty(empty)
      // Collapse leftover empty paragraphs to one
      if (empty && doc.childCount > 1) {
        requestAnimationFrame(() => {
          editor.commands.setContent({ type: 'doc', content: [{ type: 'paragraph' }] })
        })
      }
      let urgent = false
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'urgentMention') urgent = true
      })
      setHasUrgent(urgent)
    },
  })

  editorRef.current = editor

  const handleSend = () => {
    const text = serializeToText(editor)
    if (!text) return
    onSend?.(text)
    editor?.commands.clearContent(true)
    editor?.commands.focus()
    setIsEmpty(true)
    setHasUrgent(false)
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative bg-bg-inset border border-border-default focus-within:border-border-strong rounded-lg p-3 flex flex-col gap-4 transition-colors">
        {/* Editable area — blockquote bar when urgent */}
        <div className={cn(
          'relative min-h-[20px] transition-all',
          hasUrgent && 'border-l-[4px] border-border-strong pl-2'
        )}>
          <EditorContent editor={editor} />
          {isEmpty && (
            <div className="absolute inset-0 pointer-events-none flex items-center gap-1 text-sm text-text-muted leading-[1.4] flex-wrap">
              <span>Start a new conversation or type</span>
              <kbd className="inline-flex items-center border border-border-strong rounded-sm px-1 py-[1px] text-[12px] text-text-secondary leading-[1.2]">
                /
              </kbd>
              <span>for commands</span>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <IconButton aria-label="Attach file">
              <IconPaperclip size={16} stroke={1.5} />
            </IconButton>
            <IconButton aria-label="Snooze">
              <IconSquareForbid2 size={16} stroke={1.5} />
            </IconButton>
          </div>

          <button
            onMouseDown={(e) => {
              e.preventDefault()
              handleSend()
            }}
            disabled={isEmpty}
            aria-label="Send"
            className={cn(
              'flex items-center justify-center p-1 rounded-lg transition-colors',
              !isEmpty
                ? 'bg-accent-primary hover:bg-accent-hover text-text-inverse cursor-pointer'
                : 'bg-bg-disabled text-text-disabled pointer-events-none'
            )}
          >
            <IconArrowUp size={16} stroke={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
