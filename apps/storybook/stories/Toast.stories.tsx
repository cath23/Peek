import type { Meta } from '@storybook/react-vite'
import { ToastProvider, useToast, Button } from '@nostr-for-business/ui'

/**
 * Transient notification anchored bottom-left. Trigger via `useToast().showToast(...)`;
 * auto-dismisses after `durationMs` (default 5s). Variants: success / brand / neutral,
 * with an optional inline action.
 */
const meta = {
  title: 'Feedback/Toast',
  decorators: [(Story) => <ToastProvider><Story /></ToastProvider>],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

function ToastDemo() {
  const { showToast } = useToast()
  return (
    <div className="flex flex-col gap-3 items-start">
      <Button onClick={() => showToast({ label: 'Topic created', type: 'success' })}>
        Success toast
      </Button>
      <Button variant="outlined" onClick={() => showToast({ label: 'Added to starred', type: 'brand' })}>
        Brand toast
      </Button>
      <Button
        variant="muted"
        onClick={() => showToast({ label: 'Message sent', type: 'neutral', actionLabel: 'Undo', onAction: () => {} })}
      >
        Neutral toast + action
      </Button>
    </div>
  )
}

export const Default = {
  render: () => <ToastDemo />,
}
