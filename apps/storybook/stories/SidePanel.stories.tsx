import type { Meta } from '@storybook/react-vite'
import {
  SidePanel, SidePanelHeader, SidePanelBody, SidePanelFooter,
  IconButton, Composer,
} from '@nostr-for-business/ui'
import { IconX, IconPaperclip } from '@tabler/icons-react'

const meta = {
  title: 'Layout/SidePanel',
  component: SidePanel,
  tags: ['autodocs'],
} satisfies Meta<typeof SidePanel>

export default meta

export const Default = {
  render: () => (
    <div className="h-[480px] w-[380px] border border-border-subtle rounded-lg overflow-hidden bg-bg-surface">
      <SidePanel>
        <SidePanelHeader>
          <span className="text-body-2-strong text-text-primary">Replies</span>
          <IconButton aria-label="Close"><IconX size={16} stroke={1.5} /></IconButton>
        </SidePanelHeader>
        <SidePanelBody>
          <div className="p-4 flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="text-body-2 text-text-secondary">Message {i + 1}</div>
            ))}
          </div>
        </SidePanelBody>
        <SidePanelFooter>
          <Composer
            canSend
            tools={<IconButton aria-label="Attach"><IconPaperclip size={16} stroke={1.5} /></IconButton>}
          >
            <div className="text-sm text-text-muted">Reply…</div>
          </Composer>
        </SidePanelFooter>
      </SidePanel>
    </div>
  ),
}
