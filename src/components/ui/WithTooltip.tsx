import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Tooltip } from './Tooltip'
import { type ReactNode } from 'react'

interface WithTooltipProps {
  label: string
  placement?: 'top' | 'bottom'
  children: ReactNode
}

export function WithTooltip({ label, placement = 'top', children }: WithTooltipProps) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setPos({
        x: rect.left + rect.width / 2,
        y: placement === 'bottom' ? rect.bottom : rect.top,
      })
    }
    setShow(true)
  }

  const transform =
    placement === 'bottom'
      ? 'translateX(-50%) translateY(6px)'
      : 'translateX(-50%) translateY(calc(-100% - 6px))'

  return (
    <div
      ref={ref}
      className="inline-flex shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: pos.x,
              top: pos.y,
              transform,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            <Tooltip label={label} />
          </div>,
          document.body
        )}
    </div>
  )
}
