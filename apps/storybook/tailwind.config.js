import { createRequire } from 'module'
const require = createRequire(import.meta.url)

/** @type {import('tailwindcss').Config} */
export default {
  presets: [require('@nostr-for-business/tokens/tailwind-preset.cjs')],
  content: [
    './stories/**/*.{ts,tsx}',
    './.storybook/**/*.{ts,tsx}',
    // Scan the shared UI package so its classes are generated.
    '../../packages/ui/src/**/*.{ts,tsx}',
    // Scan the Peek app so classes used only by Peek/* stories survive.
    '../../apps/peek/src/**/*.{ts,tsx}',
  ],
}
