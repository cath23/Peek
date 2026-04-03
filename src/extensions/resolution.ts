import { Node, InputRule } from '@tiptap/core'

/**
 * ResolutionBlock — a block node triggered by typing "-> " at the start of a paragraph.
 * Renders with a left border in the editor. On send, the text is extracted as a resolution
 * message and stripped from the visible message body.
 */
export const ResolutionBlock = Node.create({
  name: 'resolutionBlock',
  group: 'block',
  content: 'inline*',

  parseHTML() {
    return [{ tag: 'div[data-resolution]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, 'data-resolution': 'true', style: 'border-left: 3px solid var(--border-strong); padding-left: 8px;' }, 0]
  },

  addInputRules() {
    return [
      new InputRule({
        find: /^->\s$/,
        handler: ({ state, range, commands }) => {
          const blockType = state.schema.nodes.resolutionBlock
          if (!blockType) return

          // Delete the "-> " trigger text
          commands.deleteRange({ from: range.from, to: range.to })
          // Convert the now-empty paragraph to a resolutionBlock
          commands.setNode('resolutionBlock')
          // Insert the → arrow prefix
          commands.insertContent('→ ')
        },
      }),
    ]
  },

  addKeyboardShortcuts() {
    return {
      // Backspace on empty resolution block: convert back to paragraph
      Backspace: ({ editor }) => {
        const { state } = editor
        const { $from } = state.selection
        const node = $from.parent
        if (node.type.name !== 'resolutionBlock') return false
        if (node.textContent.length === 0 && $from.parentOffset === 0) {
          editor.commands.setNode('paragraph')
          return true
        }
        return false
      },
    }
  },
})

/** Sentinel words that mean "resolve with no message" */
const EMPTY_SENTINELS = new Set(['', 'done', 'resolve', 'resolved'])

/**
 * Extract resolution info from a Tiptap editor doc.
 * Returns { hasResolution, resolutionMessage } where resolutionMessage is empty
 * if the text was a sentinel like "done" or "resolve".
 */
export function extractResolution(editor: { state: { doc: { forEach: (cb: (node: { type: { name: string }; textContent: string }) => void) => void } } }): {
  hasResolution: boolean
  resolutionMessage: string
} {
  let hasResolution = false
  let resolutionMessage = ''

  editor.state.doc.forEach((node) => {
    if (node.type.name === 'resolutionBlock') {
      hasResolution = true
      const raw = node.textContent.trim()
      // Strip the → prefix inserted by the input rule
      const text = raw.replace(/^→\s*/, '').trim()
      if (!EMPTY_SENTINELS.has(text.toLowerCase())) {
        resolutionMessage = text
      }
    }
  })

  return { hasResolution, resolutionMessage }
}
