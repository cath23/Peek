# Component Backlog — Nostr for Business monorepo

Remaining components after Phases 1–4 (monorepo + tokens + `packages/ui` + Storybook).
Cross-referenced: Figma library (file `9bMbli06kF6uGNs8zWn26y`, node `42:2`) × current code ×
`packages/ui`. See [MONOREPO-PLAN.md](MONOREPO-PLAN.md) for the full migration plan.

Legend: **High/Med/Low** = priority · "Source" = where the markup is inlined today.

---

## A. 🌐 GLOBAL — add to `@nostr-for-business/ui`

### Safe to do now (already inlined, clear API, used today) — ✅ ALL DONE
- [x] **PanelHeader** — moved `ContainerHeader.tsx` → ui (git mv, 3 call sites repointed). Story added.
- [x] **TextInput** — extracted from CreateTopicDialog; dialogs refactored. Story added.
- [x] **TextArea** — extracted from ResolveDialog; dialogs refactored. Story added.
- [x] **InputLabel** — extracted from dialogs (required/optional asterisk). Story added.
- [x] **ShortcutBadge** — deduped the `<kbd>` chip across MenuItem, SearchInput, ComposeBox (slash hint + command list). Story added.

> Note: font in the four input/badge primitives uses explicit arbitrary values
> (`text-[14px]`, `text-[12px]`) instead of `text-body-2`/`text-caption`, because
> tailwind-merge drops a custom `text-{name}` size when it sits beside `text-text-*`
> in a `cn()` call. See memory `feedback_twmerge_text_classes`.

### Better validated by Kanban (extract when a 2nd consumer needs them)
- [ ] **AvatarStack** — from `MemberAvatars` (HuddleCard) + member pill (ThreadPanel). Kanban assignee stack. Med.
- [ ] **UnreadIndicator** — notification dot (default/urgent), inline in cards. Kanban status dots. Med.
- [ ] **ListRow** — generic avatar+title+subtitle+trailing row, under PersonRow / MentionMenuRow / FilesResultRow. Med.
- [ ] **Badge / Pill** — generic base under HighlightPill (Chip overlaps). Low-Med.
- [ ] **BrandIcon** — from `AppIcon` in FilesMenu (github/figma/linear). Low-Med.
- [ ] **EmojiPicker** — from Peek `ReactionPicker` (generic emoji grid). Low-Med.
- [ ] **IconContainer32** — icon wrapper box. Low.

### Hooks (high value — duplicated across menus)
- [ ] **usePopover** — anchor + portal + auto-flip. Duplicated in: TopBar theme menu, DebugMenu, ConversationMoreMenu submenu, PersonChipInput dropdown, ComposeBox menus. High.
- [ ] **useDismiss** — outside-click + Escape. Duplicated in: TopBar, ComposeBox highlight picker, others. High.

---

## B. 🟣 PEEK — existing components (stay in `apps/peek`), remaining work

### Menus → adopt the shared `Menu`/`MenuItem` surface (removes duplicated popover markup)
- [ ] **ConversationQuickMenu** → adopt `Menu`/`MenuItem`.
- [ ] **TopicMenu** → adopt `Menu`.
- [ ] **FilesMenu** → adopt `Menu`; extract inline `AppIcon`→BrandIcon; rows→ListRow.
- [ ] **MentionMenu** → adopt `Menu`/`ListRow`.
- [ ] **DebugMenu** → adopt `Menu`.
- [ ] **TopBar** theme menu (inline) → adopt `Menu`.

### Compose / rebase on new globals
- [ ] **ConversationHeader** → compose `PanelHeader`; `AvatarGroup`→AvatarStack.
- [ ] **HuddleCard** → extract `MemberAvatars`→AvatarStack.
- [ ] **HighlightPill** (+ HighlightSwatch) → rebase on `Badge`.
- [ ] **ReactionPicker** → becomes thin wrapper over global `EmojiPicker`.
- [ ] **Dialogs** (Resolve/CreateTopic/StartHuddle) → swap raw inputs for `TextInput`/`TextArea`/`InputLabel`.

### Already done (reference)
- ✅ ConversationMoreMenu uses `Menu`. Dialogs use `DialogShell`. ThreadPanel uses `SidePanel`.
- ✅ ComposeBox uses `Composer`. Avatar/PersonChipInput/TopicTabs are wrappers over ui.

### Domain-only (no shared value — leave as Peek)
- ConversationCard, ThreadReplyCard, ScreenerSection, StarredSection, TopicState,
  DebugMenu (dev), NavRail/NavItem (chrome content), useDmConversationView/useTopicView (hooks).

---

## C. 🧩 Figma components that are NOT real code yet (inline / composed)

Decide per item whether to formalize. Most can stay inline.
- `PinnedMessage` — inline in ThreadPanel (Peek atom; optional extract).
- `MembersPill` — inline in ThreadPanel (→ Peek wrapper over AvatarStack).
- `ReplyCount`, `ResolutionMessage`, `TopicStatusTexts` — inline in cards (Peek atoms; optional).
- `InlineTag` — rendered via Tiptap/text-parsing extensions, NOT a component. Leave as-is.
- `EditMessageBox` — inline edit mode in cards (Peek; optional).
- `RightPanel` (topic/dm/empty/huddles) — composed in useTopicView/useDmConversationView. Stays composed.
- `SidebarPanel` (people/topics) — left panel composed in pages. Stays composed.
- `NewHuddleButton`, `HuddleGrid`, `PersonRowList` — inline in views (Peek; optional extract).

### Deferred shells (extract when a 2nd app needs them)
- Generic `AppBar` (from TopBar), generic `NavRail`/`NavItem` (router-coupled), `SidebarSection` (from StarredSection).

---

## Suggested order
1. **Safe-now globals**: PanelHeader (move), TextInput, TextArea, InputLabel, ShortcutBadge — each with a Storybook story; refactor dialogs to use them.
2. **Menu adoption** sweep across the 5 Peek menus + TopBar theme menu.
3. **Kanban (Phase 5)** — build the board; extract AvatarStack / UnreadIndicator / ListRow / BrandIcon / EmojiPicker + usePopover/useDismiss as the board demands them (real 2nd consumer validates each API).
