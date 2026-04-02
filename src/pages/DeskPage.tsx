import { AppShell } from '@/layouts/AppShell'
import { ContainerHeader } from '@/components/ContainerHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export function DeskPage() {
  return (
    <AppShell
      leftPanel={
        <div className="flex flex-col h-full">
          <ContainerHeader title="Desk" />
          {/* Category sections — pt-4 pb-3 px-3 gap-4, built next */}
          <div className="flex-1 overflow-y-auto pt-4 pb-3 px-3 flex flex-col gap-4" />
        </div>
      }
      rightPanel={
        <div className="flex-1 flex items-center justify-center h-full">
          <EmptyState />
        </div>
      }
    />
  )
}
