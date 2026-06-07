import { useEffect } from 'react'
import type { Preview, Decorator } from '@storybook/react-vite'

// Design tokens (same order as the app: base vars, brand theme, then Tailwind layers).
import '@nostr-for-business/tokens/base.css'
import '@nostr-for-business/tokens/themes/peek.css'
import './tailwind.css'

/** Applies the selected theme by toggling the `dark` class (matches Peek's ThemeProvider). */
const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string) ?? 'dark'
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="bg-bg-base text-text-primary p-8 min-h-[160px] flex items-start">
      <Story />
    </div>
  )
}

const preview: Preview = {
  initialGlobals: {
    theme: 'dark',
  },
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
  parameters: {
    backgrounds: { disable: true },
    controls: { expanded: true },
  },
}

export default preview
