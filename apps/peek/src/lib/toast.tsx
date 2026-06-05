import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconCircleCheck } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'brand' | 'neutral'

interface ToastOptions {
  label: string
  /** Visual variant per Figma (Alert component): success, brand, or neutral. Defaults to 'success'. */
  type?: ToastType
  /** When set, renders a clickable action on the right side. */
  actionLabel?: string
  onAction?: () => void
  /** Show the leading circle-check icon. Defaults to true. */
  leadingIcon?: boolean
  /** Auto-dismiss after this many ms. Defaults to 5000. Pass 0 to disable. */
  durationMs?: number
}

interface ActiveToast extends ToastOptions {
  id: number
}

interface ToastValue {
  showToast: (opts: ToastOptions) => void
  dismissToast: () => void
}

const ToastContext = createContext<ToastValue | null>(null)

let toastSeq = 0

const SURFACE_BY_TYPE: Record<ToastType, string> = {
  success: 'bg-success-muted',
  brand: 'bg-accent-muted',
  neutral: 'bg-bg-inset border border-border-subtle',
}

const ACTION_BORDER_BY_TYPE: Record<ToastType, string> = {
  success: '',
  brand: '',
  neutral: 'border border-border-default',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null)

  const showToast = useCallback((opts: ToastOptions) => {
    setToast({ ...opts, id: ++toastSeq })
  }, [])

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  useEffect(() => {
    if (!toast) return
    const duration = toast.durationMs ?? 5000
    if (duration <= 0) return
    const timer = setTimeout(() => {
      setToast((current) => (current?.id === toast.id ? null : current))
    }, duration)
    return () => clearTimeout(timer)
  }, [toast])

  const value = useMemo<ToastValue>(() => ({ showToast, dismissToast }), [showToast, dismissToast])

  const type = toast?.type ?? 'neutral'
  const showIcon = toast ? toast.leadingIcon ?? true : false
  const hasAction = !!(toast?.actionLabel && toast.onAction)

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast &&
        createPortal(
          <div className="fixed bottom-4 left-4 z-[100] pointer-events-none">
            <div
              className={cn(
                'pointer-events-auto inline-flex items-center min-h-[32px] pl-2 pr-1 py-1 rounded-lg shadow-lg',
                hasAction ? 'gap-[46px]' : '',
                SURFACE_BY_TYPE[type],
              )}
            >
              <div className="flex items-center gap-2 shrink-0">
                {showIcon && (
                  <IconCircleCheck size={16} stroke={1.5} className="text-text-primary shrink-0" />
                )}
                <span className="font-normal text-[14px] leading-[1.4] text-text-primary whitespace-nowrap">
                  {toast.label}
                </span>
              </div>
              {hasAction && (
                <button
                  type="button"
                  onClick={() => {
                    toast.onAction?.()
                    dismissToast()
                  }}
                  className={cn(
                    'h-6 flex items-center justify-center gap-1 px-1 py-1 rounded-md shrink-0 transition-colors',
                    ACTION_BORDER_BY_TYPE[type],
                    type === 'neutral' ? 'hover:border-border-strong' : 'hover:opacity-80',
                  )}
                >
                  <span className="font-medium text-[12px] leading-[12px] text-text-primary whitespace-nowrap">
                    {toast.actionLabel}
                  </span>
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
