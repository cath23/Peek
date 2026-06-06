import { useState, type ReactNode } from 'react'

interface AppShellProps {
  /** Top bar slot. Render-prop receives collapse controls — the bar's menu button
   *  typically calls toggleCollapsed to hide/show the nav rail + left panel. */
  topBar?: (api: { collapsed: boolean; toggleCollapsed: () => void }) => ReactNode
  navRail?: ReactNode
  leftPanel?: ReactNode
  rightPanel?: ReactNode
  threadPanel?: ReactNode
}

/**
 * App layout shell: fixed top bar + collapsible nav rail + a rounded surface card that
 * holds a left panel, a main (right) panel, and an optional thread panel. Owns the
 * collapse state; all chrome and panels are slots, so any app can compose its own.
 */
export function AppShell({ topBar, navRail, leftPanel, rightPanel, threadPanel }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const toggleCollapsed = () => setCollapsed((c) => !c)

  return (
    <div className="h-screen overflow-hidden bg-bg-base relative">
      {topBar?.({ collapsed, toggleCollapsed })}

      {/* Main area - offset below the top bar */}
      <div
        className="flex h-full pt-[52px] pb-4 pr-4 transition-[padding] duration-300 ease-in-out"
        style={{ paddingLeft: collapsed ? 16 : 0 }}
      >
        {/* Nav rail - collapses to 0 width */}
        <div
          className="shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out"
          style={{ width: collapsed ? 0 : 64, opacity: collapsed ? 0 : 1 }}
        >
          {navRail}
        </div>

        {/* App card */}
        <div className="flex flex-1 min-w-0 bg-bg-surface rounded-2xl overflow-hidden">
          {/* Left panel - collapses to 0 width */}
          {leftPanel && (
            <div
              className="shrink-0 border-r border-border-subtle flex flex-col overflow-hidden transition-[width,opacity] duration-300 ease-in-out"
              style={{ width: collapsed ? 0 : 290, opacity: collapsed ? 0 : 1, borderRightWidth: collapsed ? 0 : 1 }}
            >
              {leftPanel}
            </div>
          )}

          {/* Right panel (main content area) */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {rightPanel}
          </div>

          {/* Thread panel */}
          {threadPanel && (
            <div className="shrink-0 w-[380px] border-l border-border-subtle flex flex-col overflow-hidden">
              {threadPanel}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
