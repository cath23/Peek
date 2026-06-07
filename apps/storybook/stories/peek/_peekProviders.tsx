import type { Decorator } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@nostr-for-business/ui'
import { DebugProvider } from '@/lib/debug'
import { StarredProvider } from '@/lib/starred'
import { TopicStoreProvider } from '@/lib/topicStore'
import { TopicMutationsProvider } from '@/lib/topicMutations'
import { LastSelectionProvider } from '@/lib/lastSelection'
import { ToastProvider } from '@/lib/toast'

/**
 * Wraps a Peek story in the same provider tree as the app (main.tsx), but with a
 * MemoryRouter instead of BrowserRouter so stories don't touch the URL bar. All Peek
 * providers take only `children`, so no story-specific configuration is needed.
 *
 * Usage in a Peek story: `decorators: [withPeekProviders]`.
 */
export const withPeekProviders: Decorator = (Story) => (
  <MemoryRouter initialEntries={['/topics']}>
    <ThemeProvider>
      <DebugProvider>
        <StarredProvider>
          <TopicStoreProvider>
            <TopicMutationsProvider>
              <LastSelectionProvider>
                <ToastProvider>
                  <Story />
                </ToastProvider>
              </LastSelectionProvider>
            </TopicMutationsProvider>
          </TopicStoreProvider>
        </StarredProvider>
      </DebugProvider>
    </ThemeProvider>
  </MemoryRouter>
)
