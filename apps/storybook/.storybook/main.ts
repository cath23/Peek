import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { StorybookConfig } from '@storybook/react-vite'

const here = dirname(fileURLToPath(import.meta.url))
/** apps/peek/src — Peek stories import its components via the same `@` alias the app uses. */
const peekSrc = resolve(here, '../../peek/src')

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(viteConfig) {
    viteConfig.resolve ??= {}
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias as Record<string, string> | undefined),
      '@': peekSrc,
    }
    // Peek lives in another workspace package with its own React; force a single copy so
    // hooks don't blow up with "invalid hook call".
    viteConfig.resolve.dedupe = [
      ...(viteConfig.resolve.dedupe ?? []),
      'react',
      'react-dom',
      // Share a single Router context instance between the decorator's MemoryRouter and
      // Peek components' useLocation/NavLink (resolved from peek's own node_modules).
      'react-router-dom',
      'react-router',
    ]
    return viteConfig
  },
}

export default config
