import { createRequire } from 'module'
const require = createRequire(import.meta.url)

/** @type {import('tailwindcss').Config} */
export default {
  presets: [require('@nostr-for-business/tokens/tailwind-preset.cjs')],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    // Scan shared UI package so Tailwind keeps classes used only inside it.
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
}
