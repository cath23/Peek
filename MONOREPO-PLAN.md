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

**Status (updated after Phase 1):**
- `main` @ `ae51df5` — pre-monorepo restore point (still single-app layout). Untouched.
- Tag `pre-monorepo` @ `4dbf237` — pushed; pinpoint restore for the monorepo branch.
- `monorepo` @ `3aabaed` — Phase 1 done: repo promoted to `k:/PeekApp`, app at `apps/peek`,
  pnpm+Turborepo scaffolded, builds + tests green.
- **Repo root moved**: was `k:/PeekApp/peek-app/`, now `k:/PeekApp/`.

### The one irreversible-by-checkout step
Phase 1 moves the `.git` directory **up** from `peek-app/` to the workspace root. That is
a filesystem move, not a git operation, so "checkout main" can't undo it by itself. It is
still safe because:
- `origin/main` is the backstop (re-clone restores everything).
- We snapshot a tag (`pre-monorepo`) before the move.
- The move itself is one reversible `mv` we can invert.

Commit after **every** phase so each is an isolated, revertible step.

---

## 3. Component split — master list

Reconciled across **code** (`apps/peek/src`) and **Figma** (file `9bMbli06kF6uGNs8zWn26y`):
- Figma node `3:2` = **Design Tokens** page → maps to `packages/tokens`.
- Figma node `42:2` = **Components** page (~80 components) → maps to `packages/ui` + `apps/peek`.

> **Pre-validated in Figma.** The "extract a shell, swap the content" model is already
> how the Figma library is built: a `Menu` component exposes a `content` slot, with
> swappable `TopicMenuContent` / `MentionMenuContent` / `FilesMenuContent` /
> `ConversationMoreMenuContent*`; `DialogShell` exposes a body slot with
> `DialogBodyContent` (resolve/createTopic). There is even a "How to use — content swap"
> guide frame. So Phase 3 extraction maps **1:1** to existing Figma components, not a
> new invention.

### Buckets
- **A — Generic now**: move to `packages/ui` as-is (or tiny tweak).
- **B — Extract a shell**: pull the reusable skeleton into `packages/ui`; the Peek content
  that fills it stays in `apps/peek`. ← the high-value bucket.
- **C — Peek domain**: stays in `apps/peek`, refactored to compose A + B.

---

### 🌐 GLOBAL → `@nostr-for-business/ui`

**Primitives (atoms):**
`Button`, `IconButton`, `Avatar`, `AvatarStack` (from MemberAvatars), `Chip`,
`Badge/Pill` (underlies HighlightPill), `Divider`, `DateDivider`, `Tooltip`,
`ShortcutBadge`/`KeyboardHint`, `SearchInput` (drop "Search Peek" default), `TextInput`,
`TextArea`, `InputLabel`, `EmptyState`, `Tabs` (Tab + TabBar), `NavItem`, `SectionHeader`,
`PanelHeader` (rename of ContainerHeader), `Reaction`, `ReactionPicker` + `EmojiButton`,
`UnreadIndicator`, `Backdrop`, `IconContainer32`, `BrandIcon` (AppIcon: github/figma/linear),
`ListRow` (from PersonRow/MentionMenuRow), `MenuItem`, `MenuSectionHeader`.

**Shells / slots (Bucket B):**
`Menu` (surface + content slot), `DialogShell` (+ DialogBodySlot + Backdrop),
`SidePanel` (from ThreadPanel/RightPanel), `AppShell` (expanded/collapsed),
`TopBar` (app-bar shell), `NavRail` (rail shell), `SidebarSection`,
`ChipInput`/`TokenInput` (from PersonChipInput), `Composer` (ComposeBox frame;
extensions stay in Peek).

**Shared hooks → `@nostr-for-business/ui`:**
`usePopover` (anchor + portal + auto-flip), `useDismiss` (outside-click + Escape).
`cn()` and `ThemeProvider`/`useTheme` live in `@nostr-for-business/tokens`.

---

### 🟣 PEEK-SPECIFIC → `apps/peek`

**Domain cards & views:**
`ConversationCard` (15 variants), `ThreadReplyCard`, `HuddleCard`, `PersonRow`,
`PersonRowList`, `ConversationHeader` (topic/dm), `ThreadPanel` (conversation/huddle),
`RightPanel` (topic/dm/empty/huddles), `SidebarPanel` (people/topics), `PinnedMessage`,
`HuddleGrid`, `NewHuddleButton`.

**Menu content (plug into global `Menu`):**
`ConversationMoreMenuContentDM`, `ConversationMoreMenuContentTopic`,
`ReplyMoreMenuContent`, `HuddleMoreMenuContent`, `ConversationQuickMenu`,
`HighlightMenuItem`, `HighlightSubmenuContent`, `TopicMenuContent`,
`MentionMenuContent` (people/urgent), `FilesMenuContent` (browse-L1/L2/search),
rows: `MentionMenuRow`, `TopicMenuRow`, `FilesAppNavRow`, `FilesResultRow`,
`FilesBackHeader`.

**Dialog content (plug into global `DialogShell`):**
`DialogBodyContent` (resolve / createTopic), `EditMessageBox`.

**Domain atoms:**
`TopicState` (resolved/DM/team/group/view), `HighlightPill` + `HighlightSwatch`,
`InlineTag` (mention/urgent/topic-ref/file-ref/highlight), `ResolutionMessage`,
`ReplyCount`, `TopicStatusTexts`, `MembersPill`, ComposeBox Tiptap extensions
(@mention, `[topic`, `!urgent`).

---

### 🔵 KANBAN → `apps/kanban` (blue theme)

**Reuses from global (no new work):** `AppShell`, `TopBar`, `NavRail`, `NavItem`, `Menu`,
`MenuItem`, `DialogShell`, `SidePanel`, `Tabs`, `Button`, `IconButton`, `Avatar`,
`AvatarStack`, `Chip`, `SearchInput`, `TextInput`, `TextArea`, `ChipInput`,
`SectionHeader`, `PanelHeader`, `EmptyState`, `Tooltip`, `Backdrop`, `BrandIcon`.

**Net-new (board-specific):**
| Component | Built from |
|---|---|
| Board | layout |
| BoardColumn | PanelHeader + count + add |
| KanbanCard | title, LabelBadge, assignee, priority, id |
| LabelBadge | ← Chip/Badge |
| PriorityIcon / StatusIcon | new icons |
| AssigneeAvatarStack | ← AvatarStack |
| IssueDetailPanel | ← SidePanel |
| NewIssueDialog | ← DialogShell + DialogBodyContent |
| IssueContextMenu | ← Menu + MenuItem |
| BoardFilterBar / FilterMenu | ← Menu |
| ViewTabs / BoardSwitcher | ← Tabs |
| CardDragOverlay / ColumnDropZone | `@dnd-kit` |

~22 reused vs ~12 new — the board is mostly composition of existing shells.

---

### `packages/tokens` (infrastructure, not "components")
`lib/utils.ts` (`cn()`), `lib/theme.tsx` (ThemeProvider/useTheme), `index.css` vars
(renamed to **semantic** roles in Phase 2), `tailwind.config.js` token mappings,
per-brand theme css (peek purple / kanban blue / canvas green).

> Rule of thumb: if Kanban could plausibly use it and it has no Peek concepts baked in,
> it's global. Providers and context go in tokens/infra, not ui.

---

## 4. Phased execution

Each phase ends green (app still runs) and gets its own commit.

### Phase 0 — Baseline ✅ DONE
- HuddleCard/debug WIP committed onto `main` (`ae51df5`) and pushed.
- `monorepo` branch created from `main`, pushed. Restructuring starts here.

### Phase 1 — Scaffold workspace, move app in-place ✅ DONE
1. ✅ Tagged `pre-monorepo` (pushed) — permanent restore point.
2. ✅ `git mv` all app files → `apps/peek/*` (history follows), then moved `.git` + `apps`
   up to `k:/PeekApp/`; removed leftover `peek-app/`. Repo root is now `k:/PeekApp`.
3. ✅ Added root `package.json` (name `nostr-for-business`), `pnpm-workspace.yaml`,
   `turbo.json`, `tsconfig.base.json`, root `.gitignore`.
4. ✅ Renamed app package `peek-app` → `peek`; declared `@tiptap/core` (pnpm is strict
   about transitive deps npm hoisted); dropped `package-lock.json` for `pnpm-lock.yaml`.
5. ✅ `pnpm install` + `pnpm build` (turbo) green + 50/50 tests pass.
- **Exit check:** ✅ Peek builds & tests identically from `apps/peek`. Nothing extracted yet.
- Commits: `a1b916c` (nest), `3aabaed` (scaffold).
- Note: `PRDs/`, `QA-PLAN.md`, `.claude/` left untracked at root (decide later).

### Phase 2 — Extract `packages/tokens` ✅ DONE
1. ✅ Created `packages/tokens`: `tailwind-preset.cjs` (typography/radius/colors→var/
   shadows), `base.css` (brand-neutral vars + base element styles), `themes/peek.css`.
2. ✅ **No rename needed** — tokens were already semantic (`accent-primary` → `var(...)`,
   not `purple`). Only work was isolating the brand vars: just **4** (`--accent-primary`,
   `--accent-hover`, `--accent-muted`, `--border-focus`) → `themes/peek.css`. Everything
   else (bg/text/border/semantic/shadows) is brand-neutral in `base.css`.
3. ✅ `apps/peek/tailwind.config.js` uses the preset via `createRequire` (ESM config →
   CJS preset) + `content` glob includes `../../packages/ui/src/**/*`.
4. ✅ Peek imports `tokens/base.css` + `themes/peek.css` in `main.tsx` (JS import, before
   `index.css`); `index.css` trimmed to `@tailwind` + tiptap only.
- **Exit check:** ✅ build green, 50/50 tests, dev serves; bundle vars match original
  exactly (`--accent-primary #8b5cf6/#a78bfa`, `--bg-base`, `--border-focus`). Commit `2008ce9`.
- **Deviation from plan:** `tokens` is kept **framework-agnostic** (pure CSS + preset, no
  React). `ThemeProvider`/`useTheme` stays in `apps/peek/src/lib/theme.tsx` this phase and
  moves to `packages/ui` in Phase 3. Brand = which `themes/<brand>.css` an app imports
  (app-level), so the provider only needs to handle dark/light — no brand logic.
- **Multi-theme ready:** Kanban/Canvas add `themes/kanban.css` (blue) / `themes/canvas.css`
  (green) overriding the same 4 vars; nothing else changes.

### Phase 3 — Extract `packages/ui` ✅ DONE
Done in verified, independently-committed batches (build green + 50/50 tests each):
- **3-batch1** ✅ `cn` + Button, Chip, Divider, Tooltip, WithTooltip, IconButton (`4387c6e`).
- **3-batch2** ✅ DateDivider, EmptyState, Reaction, SearchInput, SectionHeader; **wrapper
  pattern** for Avatar (pure core + Peek name-resolving wrapper) and Tabs (generic +
  Peek TopicTabs wrapper) (`b0905ae`).
- **3-batch3a** ✅ ThemeProvider/useTheme moved to ui; `cn` deduped (deleted app
  `lib/utils.ts`) (`0646f02`).
- **3-batch3b** ✅ `Menu`/`MenuItem`/`MenuSection` shell; ConversationMoreMenu composes it (`a6b86d5`).
- **3-batch3c** ✅ `DialogShell`; Resolve/CreateTopic/StartHuddle dialogs composed onto it (`7a9a80d`).
- **3-batch3d-i** ✅ `AppShell` slot layout; Peek wrapper passes TopBar+NavRail as slots (`14bfb46`).
- **3-batch3d-ii** ✅ generic `ChipInput<T>` (render-props); PersonChipInput wraps it (`37308e3`).
- **3-batch3d-iii** ✅ `SidePanel`/`SidePanelHeader`/`SidePanelBody`/`SidePanelFooter`;
  ThreadPanel refactored onto them (`4f5aa61`).
- **3-batch3d-iv** ✅ `Composer` frame (tools/popover/children slots + send); ComposeBox
  composes it, keeping all Tiptap/Peek logic (`bc139a6`).

`@nostr-for-business/ui` exports: **cn, ThemeProvider/useTheme**, Avatar, Button, Chip,
Divider, DateDivider, EmptyState, Reaction, SearchInput, SectionHeader, Tooltip,
WithTooltip, IconButton, Tabs, **Menu/MenuItem/MenuSection, DialogShell, AppShell,
ChipInput, SidePanel(+Header/Body/Footer), Composer**.

**Exit check:** ✅ build green, 50/50 tests, dev server serves (HTTP 200). All app imports
come from `@nostr-for-business/ui`; menu/dialog/composer/side-panel surface markup no longer
duplicated in the app. `.gitattributes` added (LF normalization).

**Deliberately NOT extracted (deferred):**
- Generic `AppBar`/`NavRail`/`NavItem` — Peek's TopBar/NavRail stay as slot *content*; the
  reusable shell is `AppShell`. Extract a generic AppBar when a 2nd app needs it.
- Adopting `Menu` surface in the other menus (ConversationQuickMenu, TopBar theme menu,
  DebugMenu, TopicMenu, FilesMenu) — incremental cleanup, do opportunistically.
- hooks `usePopover` / `useDismiss` — extract when a 2nd consumer appears (Kanban).

### Phase 4 — Storybook app ✅ DONE (`1cb8ffb`)
- `apps/storybook`: Storybook 10 + react-vite (Vite 8 / React 19 compatible).
- Shares the Tailwind preset + tokens CSS; `preview.tsx` imports base.css + themes/peek.css
  and adds a dark/light theme toolbar (toggles `.dark`). Content glob scans `packages/ui/src`.
- CSF3 + autodocs stories for all current exports (primitives + shells). `storybook build`
  and `storybook dev` both verified.

**Phase 4b — UI gaps surfaced by Storybook (candidates to add to `packages/ui`):**
Building stories made these missing/inlined primitives obvious. Most are currently inlined
in dialogs/menus and are needed by Kanban too:
- `TextInput` + `TextArea` — dialogs use raw `<input>`/`<textarea>` (Figma has both).
- `InputLabel` — dialogs use raw `<label>` (Figma has required/optional variants).
- `ShortcutBadge` / `KeyboardHint` — the `<kbd>` chip is inlined in SearchInput, Menu, Composer.
- `Badge` / `Pill` — generic base under HighlightPill (Chip covers some, but not the pill).
- `AvatarStack` — from Peek's MemberAvatars (overlapping avatars + count).
- `UnreadIndicator` — the dot (default/urgent).
- `BrandIcon` (AppIcon: github/figma/linear) — reusable by Kanban integrations.
- `ListRow` — generic avatar+title+subtitle+trailing row (under PersonRow / menu rows).
- `usePopover` / `useDismiss` hooks — dropdown positioning + outside-click/Escape.
Decide per item whether to extract now (cleaner) or when Kanban needs it.

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
