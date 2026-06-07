import { useState, useRef, useMemo, useEffect, useLayoutEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconX } from '@tabler/icons-react'
import { cn } from './lib/cn'

interface ChipInputProps<T> {
  value: T[]
  onChange: (next: T[]) => void
  /** The full pool of selectable items. Already-selected and excluded items are filtered out. */
  suggestions: T[]
  getKey: (item: T) => string
  /** Returns true if the item matches the (lowercased, trimmed) query. */
  filterFn: (item: T, query: string) => boolean
  /** Inner content of a selected chip (the remove button is added automatically). */
  renderChip: (item: T) => ReactNode
  /** Inner content of a dropdown option row. */
  renderOption: (item: T) => ReactNode
  /** Keys excluded from suggestions (e.g. the current user). */
  excludeKeys?: string[]
  placeholder?: string
  autoFocus?: boolean
}

/**
 * Generic token / chip input: type to filter a suggestion list, Enter/click to add a chip,
 * Backspace to remove the last. Chip + option appearance is supplied by render-props, so it
 * works for people, labels, assignees, etc. without knowing the item shape.
 */
export function ChipInput<T>({
  value,
  onChange,
  suggestions,
  getKey,
  filterFn,
  renderChip,
  renderOption,
  excludeKeys = [],
  placeholder = 'Search…',
  autoFocus,
}: ChipInputProps<T>) {
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const matches = useMemo(() => {
    const selectedKeys = new Set(value.map(getKey))
    const excluded = new Set(excludeKeys)
    const q = query.trim().toLowerCase()
    return suggestions.filter((item) => {
      const k = getKey(item)
      if (selectedKeys.has(k)) return false
      if (excluded.has(k)) return false
      if (!q) return true
      return filterFn(item, q)
    })
  }, [query, value, suggestions, excludeKeys, getKey, filterFn])

  useEffect(() => {
    setHighlight(0)
  }, [query, matches.length])

  const showDropdown = isFocused && matches.length > 0

  useLayoutEffect(() => {
    if (!showDropdown) return
    const update = () => {
      if (wrapperRef.current) setAnchorRect(wrapperRef.current.getBoundingClientRect())
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [showDropdown, value.length])

  function addItem(item: T) {
    onChange([...value, item])
    setQuery('')
    inputRef.current?.focus()
  }

  function removeItem(key: string) {
    onChange(value.filter((item) => getKey(item) !== key))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && query === '' && value.length > 0) {
      removeItem(getKey(value[value.length - 1]))
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, Math.max(0, matches.length - 1)))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const target = matches[highlight]
      if (target) addItem(target)
      return
    }
    if (e.key === 'Escape') {
      setQuery('')
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <div className="relative">
      <div
        ref={wrapperRef}
        className="bg-bg-inset border border-border-default focus-within:border-border-strong rounded-lg px-2 py-1.5 flex flex-wrap items-center gap-1.5 transition-colors min-h-[40px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((item) => {
          const key = getKey(item)
          return (
            <div
              key={key}
              className="inline-flex items-center gap-1.5 bg-bg-elevated border border-border-subtle rounded-full pl-1 pr-1 py-0.5 max-h-[24px]"
            >
              {renderChip(item)}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeItem(key)
                }}
                className="size-4 flex items-center justify-center rounded-full hover:bg-bg-hover text-text-secondary"
                aria-label="Remove"
              >
                <IconX size={10} stroke={1.5} />
              </button>
            </div>
          )
        })}

        <input
          ref={inputRef}
          autoFocus={autoFocus}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 150)
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-body-2 text-text-primary placeholder:text-text-muted outline-none border-none"
        />
      </div>

      {showDropdown && anchorRect && createPortal(
        <div
          className="fixed z-[60] max-h-[240px] overflow-y-auto bg-bg-elevated border border-border-default rounded-lg shadow-lg"
          style={{
            top: anchorRect.bottom + 4,
            left: anchorRect.left,
            width: anchorRect.width,
          }}
        >
          {matches.map((item, i) => (
            <div
              key={getKey(item)}
              className={cn(
                'flex items-center gap-3 h-12 px-3 py-1.5 cursor-pointer transition-colors',
                i === highlight ? 'bg-bg-hover' : ''
              )}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => {
                e.preventDefault()
                addItem(item)
              }}
            >
              {renderOption(item)}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
