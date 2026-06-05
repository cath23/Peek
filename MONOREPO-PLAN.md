# Monorepo Migration Plan — Nostr for Business

Turning the single Peek app into a monorepo that hosts:

- **Shared design system** (components + tokens) reused by every app
- **Peek** (existing app)
- **Storybook** documenting the shared components
- **Kanban** prototype (blue theme) — Linear-style board
- **Canvas** prototype (green theme) — Figma-style canvas (later)

Scope for shared packages: `@nostr-for-business/*`.

---

## 0. Decisions locked in

| Decision | Choice |
|---|---|
| Workspace tooling | **pnpm workspaces + Turborepo** |
| Package scope | `@nostr-for-business/*` |
| Existing app | Moved **in-place** → `apps/peek` (history preserved via `git mv`) |
| Kanban / Canvas | Pure UI **prototypes**, mock data, consumers of the shared library |
| Theming | **Multiple brand themes** — Peek (purple), Kanban (blue), Canvas (green) |
| Tokens | Must be **semantic** (`--color-primary`), not literal (`--color-purple`) |

---

## 1. Target structure (end state)

```
nostr-for-business/                  ← git root (promoted from peek-app)
├─ package.json                      ← workspace root, scripts via turbo
├─ pnpm-workspace.yaml               ← declares packages/* and apps/*
├─ turbo.json                        ← task pipeline + caching
├─ tsconfig.base.json                ← shared TS config (path aliases live here)
├─ MONOREPO-PLAN.md                  ← this file
│
├─ packages/
│  ├─ tokens/                        ← @nostr-for-business/tokens
│  │  ├─ tailwind-preset.cjs         ← theme.extend (semantic tokens)
│  │  ├─ themes/
│  │  │  ├─ peek.css                 ← :root vars (purple) + .dark overrides
│  │  │  ├─ kanban.css               ← blue
│  │  │  └─ canvas.css               ← green
│  │  ├─ base.css                    ← shared resets / @layer base
│  │  └─ package.json
│  │
│  └─ ui/                            ← @nostr-for-business/ui
│     ├─ src/
│     │  ├─ Button.tsx … (generic components)
│     │  ├─ lib/cn.ts                ← cn() helper (clsx + tailwind-merge)
│     │  └─ index.ts                 ← barrel export
│     └─ package.json
│
└─ apps/
   ├─ peek/                          ← the existing app, slimmed
   ├─ storybook/                     ← stories against @nostr-for-business/ui
   ├─ kanban/                        ← blue-themed Linear-style board (later)
   └─ canvas/                        ← green-themed Figma-style canvas (later)
```

### Why this split
- `packages/tokens` is the **single source of visual truth**. Every app extends the
  same Tailwind preset; only the CSS-variable *values* differ per theme. This is what
  makes "Kanban is blue, Canvas is green" a config change, not a rewrite.
- `packages/ui` holds only **presentational** components (no providers, no app data).
  That keeps it framework-light (no build step — apps compile the TSX via their own
  Vite) and lets Storybook render any component without booting Peek's provider tree.

---

## 2. Git safety model

Two independent undo levels at all times:

1. **Local branch** — all work happens on `monorepo`. `git checkout main` restores the
   pre-monorepo state instantly.
2. **Remote** — `origin/main` holds the pristine pre-monorepo repo; `origin/monorepo`
   holds work-in-progress. Worst case = re-clone.

**Status as of this doc:**
- `main` @ `ae51df5` — your real work (HuddleCard live reply count + debug default),
  committed & pushed. **This is the restore point** for all monorepo work.
- `monorepo` @ `ae51df5` — branched from `main`; all restructuring builds on top.
- `2372a8a` ("Huddle variants") — the prior pristine commit, still in history if you ever
  need to go further back than your HuddleCard work.

### The one irreversible-by-checkout step
Phase 1 moves the `.git` directory **up** from `peek-app/` to the workspace root. That is
a filesystem move, not a git operation, so "checkout main" can't undo it by itself. It is
still safe because:
- `origin/main` is the backstop (re-clone restores everything).
- We snapshot a tag (`pre-monorepo`) before the move.
- The move itself is one reversible `mv` we can invert.

Commit after **every** phase so each is an isolated, revertible step.

---

## 3. Component split (what goes global)

**→ `packages/ui` (generic, reused by Kanban/Canvas):**
`Avatar`, `Button`, `IconButton`, `Chip`, `Divider`, `EmptyState`, `SearchInput`,
`SectionHeader`, `Tooltip`, `WithTooltip`, `Reaction`, `DateDivider`

**→ stay in `apps/peek` (Peek-domain-specific):**
`TopicMenu`, `TopicState`, `TopicTabs`, `FilesMenu`, `MentionMenu`, `StarredSection`,
`PersonChipInput`, `PersonRow`, `ComposeBox`, `HighlightPill`

**→ `packages/tokens` (infrastructure, not "components"):**
`lib/utils.ts` (`cn()`), `lib/theme.tsx` (ThemeProvider/useTheme), `index.css` vars,
`tailwind.config.js` token mappings.

> Rule of thumb: if Kanban could plausibly use it and it has no Peek concepts baked in,
> it's global. Providers and context go in tokens/infra, not ui.

---

## 4. Phased execution

Each phase ends green (app still runs) and gets its own commit.

### Phase 0 — Baseline ✅ DONE
- HuddleCard/debug WIP committed onto `main` (`ae51df5`) and pushed.
- `monorepo` branch created from `main`, pushed. Restructuring starts here.

### Phase 1 — Scaffold workspace, move app in-place
1. Tag `pre-monorepo` on current `monorepo` HEAD.
2. Move `.git` from `peek-app/` → `k:/PeekApp/` (root). Root becomes the repo.
3. `git mv` everything that was `peek-app/*` → `apps/peek/*` (history follows).
4. Add root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`.
5. `pnpm install` at root; confirm `pnpm --filter peek dev` still runs Peek unchanged.
- **Exit check:** Peek runs identically. Nothing extracted yet.

### Phase 2 — Extract `packages/tokens`
1. Move token config into `packages/tokens` (preset + CSS vars + theme provider).
2. **Rename literal token names → semantic roles** (`primary`, `surface`, `border`,
   `muted`, `accent`, …). Define `peek.css` with current purple values.
3. `apps/peek/tailwind.config.js` → `presets: [require('@nostr-for-business/tokens/tailwind-preset.cjs')]`
   and its `content` glob includes `../../packages/ui/src/**/*`.
4. Peek imports `tokens/base.css` + `themes/peek.css` once at entry.
- **Exit check:** Peek looks pixel-identical (semantic rename is behavior-neutral).

### Phase 3 — Extract `packages/ui`
1. Move the 12 generic components into `packages/ui/src`; create barrel `index.ts`.
2. Move `cn()` into `packages/ui/src/lib` (or import from tokens).
3. Update Peek's imports: `./ui/Button` → `@nostr-for-business/ui`.
4. Codemod the import paths (search/replace) and run `tsc -b`.
- **Exit check:** `tsc -b` clean, Peek runs, all 12 components render from the package.

### Phase 4 — Storybook app (see §5 for detail)
- New `apps/storybook`, wired to the shared preset + theme, stories for every ui component.

### Phase 5 — Kanban app (blue)
1. `apps/kanban` — fresh Vite + React + TS app.
2. Extend the shared preset; load `themes/kanban.css` (blue `primary`).
3. Reuse `@nostr-for-business/ui` atoms; build kanban-specific:
   `Board`, `Column`, `KanbanCard`, `LabelBadge`, `PriorityIcon`, `AssigneeAvatarStack`.
4. Drag-and-drop via **`@dnd-kit`** (accessible, React 19-friendly).
- **Exit check:** Blue-themed board, cards drag between columns, shares Peek's atoms.

### Phase 6 — Canvas app (green) — later
- `apps/canvas`, green theme, Figma-like infinite canvas prototype. Same pattern.

---

## 5. Storybook plan (deep dive)

Storybook is effectively a **fourth app** that imports `@nostr-for-business/ui`. The work
is 80% getting Tailwind + theming wired; once that's right, stories are trivial.

### 5.1 Which Storybook
- **Storybook 8 + the Vite builder** (`@storybook/react-vite`). Matches your Vite/React 19
  stack, fast HMR, no webpack. Install in `apps/storybook` only.

### 5.2 The Tailwind wiring (the part everyone gets wrong)
Storybook must compile the same Tailwind as the apps, or components render unstyled:
1. `apps/storybook/tailwind.config.js` uses the **same preset**:
   `presets: [require('@nostr-for-business/tokens/tailwind-preset.cjs')]`.
2. Its `content` glob **must scan the ui package**:
   `content: ['../../packages/ui/src/**/*.{ts,tsx}', './stories/**/*.{ts,tsx}']`.
   (Tailwind tree-shakes unused classes — miss this and shared components lose styles.)
3. A `.storybook/preview.css` imports `tokens/base.css` + a theme css, processed by
   PostCSS/Tailwind. Import it in `.storybook/preview.tsx`.

### 5.3 Theming inside Storybook
- Wrap every story in the `ThemeProvider` via a **global decorator** in `preview.tsx`.
- Add a **toolbar toggle** (`globalTypes` + decorator) for:
  - **dark / light** (Peek defaults to dark — make sure stories can flip).
  - optionally **brand** (peek / kanban / canvas) by swapping which theme css class is
    applied — this lets you *see the same Button in purple, blue, and green*, which is the
    ultimate proof the token system works.
- Add a background/contrast addon so dark-mode components aren't on a white canvas.

### 5.4 Story coverage & conventions
- One `*.stories.tsx` per component in `packages/ui` (co-locate or under
  `apps/storybook/stories`). Co-location keeps stories next to components; a central
  folder keeps the package import-clean. **Recommended: co-locate** (`Button.stories.tsx`
  next to `Button.tsx`) and point Storybook's glob at the package.
- Use **CSF3** (Component Story Format 3): `const meta = {...}; export default meta;`
  then named exports per variant.
- For components with `class-variance-authority` variants (you use `cva`), drive stories
  with **argTypes** so every variant/size is a control — auto-documents the API.
- Add the **autodocs** tag (`tags: ['autodocs']`) so each component gets a generated docs
  page from its props/JSDoc.

### 5.5 Suggested story matrix (first pass)
| Component | Stories |
|---|---|
| Button | variants × sizes, loading, disabled, with icon |
| IconButton | sizes, active, tooltip |
| Avatar | sizes, image vs initials, status dot |
| Chip | variants, removable, with icon |
| Tooltip / WithTooltip | placements, long text clamp |
| EmptyState | with/without action |
| SearchInput | empty, typing, clearable |
| Reaction | counts, reacted state |
| Divider / DateDivider / SectionHeader | default render |

### 5.6 Nice-to-haves (after coverage)
- `@storybook/addon-a11y` — catches contrast/aria issues automatically.
- Interaction tests (`@storybook/test`) for stateful atoms (SearchInput, Reaction).
- Deploy static Storybook (Vercel/Chromatic) as a living component catalog.

### 5.7 Storybook exit checklist
- [ ] Every `packages/ui` component has at least one story.
- [ ] Dark/light toggle works; brand toggle re-themes atoms.
- [ ] No unstyled components (content glob covers the package).
- [ ] autodocs page renders props for each component.

---

## 6. Key risks & gotchas

| Risk | Mitigation |
|---|---|
| Tailwind tree-shakes shared-component classes | Every app/Storybook `content` glob must scan `packages/ui/src` |
| Two React copies → hooks crash | pnpm hoists a single React; don't pin different React majors per app |
| Literal token names block multi-theme | Phase 2 renames to semantic roles before any new app |
| `.git` move (Phase 1) not undoable by checkout | Tag `pre-monorepo` + `origin/main` backstop + invertible `mv` |
| Providers leaking into `packages/ui` | Keep ui presentational; providers live in tokens/infra |
| Verbose scope in imports | Optional short TS path alias (e.g. `@ui` → package) in `tsconfig.base.json` |

---

## 7. How to revert (quick reference)

- **Undo uncommitted edits:** `git checkout -- <file>`
- **Undo a phase:** `git reset --hard HEAD~1` (on `monorepo`)
- **Abandon all monorepo work:** `git checkout main` (then optionally delete `monorepo`)
- **Nuclear restore:** re-clone from `origin/main`
- **Undo the Phase-1 .git move:** invert the `mv` and restore from tag `pre-monorepo`

---

## 8. Open questions (revisit before Phase 5)

1. Does Kanban need shared **state utilities** (a `@nostr-for-business/state` package), or
   is per-app mock data enough? (Lean: per-app mock data for prototypes.)
2. Short import alias for the verbose scope — want one?
3. Storybook deploy target — Chromatic, Vercel, or local-only for now?
