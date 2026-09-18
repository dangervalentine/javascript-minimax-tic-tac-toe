# Night Owl restyle + motion pass

**Date:** 2026-09-18
**Repo:** `dangervalentine/javascript-minimax-tic-tac-toe`

## Goal

Re-skin the app in the Night Owl palette (dark only), replace the flat
`background-image` pieces with animated, shadow-casting marks that read as
physical objects sitting on the board, and build out a set of micro-interactions
so every state change is animated rather than instant.

The minimax logic is not the subject of this work and its behaviour does not
change.

## Non-goals

- No light theme. The light half of the supplied token set is not implemented.
- No gameplay/rules changes beyond the AI move delay noted below.
- No redesign of the header layout or information architecture.
- No refactor of `helper.js` beyond what the two bug fixes require.
- No automated test suite. Deliberately cut from scope; the minimax stays
  untested and section 7 verification is manual.

## Decisions taken

| Question | Decision |
|---|---|
| Theme scope | Dark only |
| Piece colors | X = `accent.cyan` `#7fdbca`, O = `accent.coral` `#FFAB70` |
| Piece entrance | Spring up from the board (scale 0 -> 1 with overshoot) |
| Animation approach | `motion` v12 (framer-motion), React upgraded to 19 |
| Build tool | Vite 6, replacing `react-scripts` 3.2.0 |
| Deployment | GitHub Actions on push to `master` |

---

## 1. Toolchain migration

`react-scripts` is removed entirely.

**Files**

- `public/index.html` -> `/index.html` (repo root), with
  `<script type="module" src="/src/index.jsx">` before the closing body tag.
- `src/index.js` -> `src/index.jsx`; `ReactDOM.render` -> `createRoot`.
- `src/App.js` -> `src/App.jsx`; likewise every file containing JSX.
- `src/serviceWorker.js` — **deleted**. See section 5 for why this is safe.
- `src/App.test.js` — **deleted**. CRA boilerplate smoke test; no suite
  replaces it (see Non-goals).
- `public/` retains only static assets: `favicon.ico`, `logo192.png`,
  `logo512.png`, `manifest.json`, `robots.txt`.

**`vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/javascript-minimax-tic-tac-toe/',
})
```

`base` replaces the CRA-only `homepage` field and produces the identical asset
prefix the site already serves.

**`package.json`**

```
dependencies:    react ^19, react-dom ^19, motion ^12
devDependencies: vite ^6, @vitejs/plugin-react
removed:         react-scripts, gh-pages, homepage field
scripts:         dev / build / preview
```

`package-lock.json` is regenerated so the Actions workflow's `npm ci` has a
matching lockfile.

**`index.html` corrections** (all pre-existing CRA artifacts):

| Current | Becomes | Why |
|---|---|---|
| `href="%PUBLIC_URL%/favicon.ico"` | `href="/favicon.ico"` | Vite does not substitute `%PUBLIC_URL%`; it would ship as literal text and 404 |
| `href="%PUBLIC_URL%/manifest.json"` | `href="/manifest.json"` | same |
| `href="logo192.png"` | `href="/logo192.png"` | no leading slash resolves against the page URL, not the base — already subtly wrong on the live site |
| `content="#000000"` (theme-color) | `#011627` | `background.base` |
| `content="Web site created using create-react-app"` | real description | — |

**`manifest.json`**: `short_name` / `name` -> "Tic Tac Toe",
`theme_color` -> `#011627`, `background_color` -> `#011627`.

`src/index.jsx` wraps the tree in `<MotionConfig reducedMotion="user">`, so
every animation in section 4 honours `prefers-reduced-motion` without
per-component handling.

---

## 2. Design tokens

`src/theme.css` declares the full **dark** half of the supplied palette as
`--nowl-*` custom properties on `:root`. Colors are defined in CSS only —
`motion` animates `transform`, `opacity` and `filter`, never color — so there is
no second copy of the palette in JS that can drift.

`src/index.css` keeps only the font stack and box-sizing reset.

### Mapping

| Surface | Token | Value |
|---|---|---|
| page background | `background.base` | `#011627` |
| board floor | `background.surface` | `#0A1E30` |
| header background | `background.elevated` | `#132A3E` |
| header border, grid lines | `neutral.darkGray` | `#1D3B53` |
| body text | `text.primary` | `#D6DEEB` |
| credit text | `text.muted` | `#7E8E94` |
| credit hover | `text.secondary` | `#9DB2C0` |
| button border (rest) | `secondary.dark` | `#2A3F51` |
| button border (hover/focus) | `primary.main` | `#82AAFF` |
| X mark | `accent.cyan` | `#7fdbca` |
| O mark | `accent.coral` | `#FFAB70` |
| cast shadow | `background.floor` | `#010E18` (varying alpha) |
| X win result text | `accent.cyan` | `#7fdbca` |
| O win result text | `accent.coral` | `#FFAB70` |
| draw result text | `text.muted` | `#7E8E94` |
| AI thinking indicator | `status.playing` | `#D4A44E` |

The current `.result { color: red }` is replaced by the three cases above.

---

## 3. Component architecture

`src/helper.js` is untouched apart from the section 6 mutation fix.

| File | Responsibility |
|---|---|
| `index.jsx` | `createRoot`, `MotionConfig`, global CSS imports |
| `App.jsx` | Game state, turn orchestration, effect scheduling |
| `Header.jsx` | Logo, title, credit link, button cluster |
| `DifficultyToggle.jsx` | Two-state toggle with a `layout`-animated thumb |
| `ResetButton.jsx` | Reset control with press feedback |
| `Board.jsx` | Board container, grid overlay, cells, win line, result |
| `GridLines.jsx` | Absolutely-positioned SVG, four lines, draw-in on load |
| `Cell.jsx` | One square: hover ghost, `AnimatePresence` around its mark |
| `Mark.jsx` | `<Ex/>` and `<Oh/>` inline SVG + cast-shadow ellipse |
| `WinLine.jsx` | Stroked SVG line across the winning triple |
| `Result.jsx` | Win/draw announcement |
| `motion.js` | Shared spring and duration constants |

### Interfaces

- **`Mark({ player, isWinner, isLoser })`** — renders the inline SVG
  (`stroke="currentColor"`, color set by a CSS class) plus a sibling
  `motion.div` ellipse as the cast shadow. The shadow is a separate element, not
  a `filter: drop-shadow`, so it can animate on its own curve independently of
  the mark — that independence is what produces the sense of depth.
- **`Cell({ index, value, onInsert, isInteractive, isWinner, isLoser })`** —
  owns no game state; `isInteractive` is false during the AI turn and after the
  game ends.
- **`GridLines`** — replaces the current `nth-of-type` border rules on `.cell`.
  A single SVG with four `line` elements is what makes the load-in draw
  possible; per-cell borders cannot be stroke-animated.
- **`WinLine({ alignment, pieces })`** — replaces the four
  `.cell.DR/.DL/.H/.V` gradient rules, which are removed.

### Asset changes

- `ex.svg` / `oh.svg` — hardcode `fill="#00FFFF"` and are loaded as
  `background-image`, so CSS cannot recolor them. Their geometry is inlined into
  `Mark.jsx` and the files are deleted.
- `difficulty.svg` — a two-frame sprite (99.75x50) slid via `translateX` inside
  an `overflow: hidden` box. Replaced by `DifficultyToggle.jsx`; file deleted.
- `logo.svg` — audited and recolored to palette values; kept.

---

## 4. Motion specification

All constants live in `motion.js`.

| # | Interaction | Specification |
|---|---|---|
| 1 | Board draws in on load | Four grid paths `pathLength` 0->1, `duration 0.5`, `ease [0.65,0,0.35,1]`, `staggerChildren 0.08`; header `y: -8 -> 0` + fade; board `scale 0.98 -> 1` |
| 2 | Mark springs up | `scale 0 -> 1`, spring `stiffness 500, damping 22, mass 0.8` (visible overshoot). Shadow ellipse `scaleX 0.3 -> 1`, `opacity 0 -> 0.75`, `delay 0.04` so it reads as the mark settling |
| 3 | Hover ghost | `whileHover` on empty cells during the player's turn only: ghost mark `opacity 0 -> 0.18`, `scale 0.9 -> 0.95`, `150ms`. Gated behind `@media (hover: hover)` so it never fires on touch |
| 4 | AI thinking pulse | While `turn === 1`: board `opacity -> 0.92`; turn indicator pulses `status.playing` on a `1.2s` `repeat: Infinity` loop |
| 5 | Win sequence | Winning marks `y: -6, scale: 1.08` with shadow scaling up; losing marks `opacity: 0.35` + `filter: grayscale(0.8)`; `WinLine` `pathLength 0 -> 1` over `450ms`; `Result` springs in after the line completes |
| 6 | Reset sweep | `AnimatePresence` exit: marks `scale -> 0` staggered `0.03` by index, win line retracts, result fades |
| 7 | Difficulty switch | `layout` animation on the sliding thumb, label crossfade, same spring as #2 |

### AI move delay

`App.js:37` currently schedules the AI move on a **200ms** `setTimeout`. At that
duration the thinking pulse (#4) registers as a flicker rather than a beat. The
delay moves to **450ms**.

This is a deliberate gameplay-feel change and the one item here that makes the
app fractionally less snappy. It is reversible by changing a single constant in
`motion.js`.

---

## 5. Deployment

The site is published at
`https://dangervalentine.github.io/javascript-minimax-tic-tac-toe/`.

### Verified: URLs do not change

The deployed `index.html` on the `gh-pages` branch references
`/javascript-minimax-tic-tac-toe/static/...`. Vite's
`base: '/javascript-minimax-tic-tac-toe/'` produces the identical prefix.
No published URL changes.

### Verified: deleting the service worker is safe

`src/index.js:12` calls `serviceWorker.unregister()`, **not** `register()`. No
visitor has ever had a service worker installed, so there is no cached-asset
migration to perform and no risk of returning visitors being served stale files
after the swap. The `service-worker.js` and `precache-manifest.*.js` files on
the `gh-pages` branch are dead CRA build output that nothing ever loaded.

This is normally the highest-risk part of a toolchain change; here it is inert.

### Verified: nothing else to carry over

- No `CNAME` file anywhere in the repo — no custom domain to preserve.
- No router — no `404.html` SPA-fallback trick in use.
- No existing `.github/workflows` — deployment is currently manual.

### New workflow

`.github/workflows/deploy.yml`, triggered on push to `master` and via
`workflow_dispatch`:

```
actions/checkout -> actions/setup-node (npm cache) -> npm ci -> npm run build
  -> actions/configure-pages
  -> actions/upload-pages-artifact (path: dist)
  -> actions/deploy-pages
```

Permissions: `contents: read`, `pages: write`, `id-token: write`.
Concurrency group `pages`, `cancel-in-progress: false`.

The `gh-pages` npm package is removed from `devDependencies`, and the open
`dependabot/npm_and_yarn/gh-pages-5.0.0` branch on the remote is made moot.

### Requires manual action (cannot be automated)

**Settings > Pages > Source must be changed from "Deploy from a branch
(gh-pages)" to "GitHub Actions".** Until this is flipped, the workflow will run
and succeed but the live site will continue serving the old `gh-pages` branch
content. The stale `gh-pages` branch can be deleted afterwards.

### Stale references (account renamed `victoriousj` -> `dangervalentine`)

Both survive on GitHub's username redirect and neither is broken today:

- `package.json` `homepage` — points at `victoriousj.github.io`. This field only
  ever controlled the path prefix, never the host, so it has had no effect on
  the live site. Removed entirely with the move to Vite's `base`.
- `Header.js:17` credit link -> `github.com/victoriousj`. User-visible; updated
  to `github.com/dangervalentine`.

---

## 6. Bug fixes

Both are pre-existing and both are load-bearing for the animation work, which
depends on clean state transitions.

**`App.js:35` — `useEffect` with no dependency array.** It re-runs after every
render and queues a fresh `setTimeout` each time. Survivable under React 16;
under React 19 StrictMode it will fire duplicate AI moves. Gains a dependency
array on `[state.turn, state.isPlaying]` plus an in-flight guard so at most one
AI move is ever scheduled.

**`App.js:46` — `enemyGo` mutates `newCells` in place.** The array it writes
to is the same one held in state. It currently works by accident, and React 19's
stricter reconciliation plus `AnimatePresence` keying make accidental identity
sharing a real source of dropped exit animations. `enemyGo` copies before
writing, matching what `insert` already does.

---

## 7. Verification

No automated test suite — see Non-goals. Verification is manual and visual.

1. `npm run build` completes; `npm run preview` serves the built output under
   the `/javascript-minimax-tic-tac-toe/` base without 404s (this is the check
   that would catch a surviving `%PUBLIC_URL%`).
2. Play a full game against each difficulty and confirm the AI still never
   loses on hard — the behaviour the two bug fixes in section 6 could regress,
   and with no test covering `getBestMove` this check is the only thing
   standing between a broken minimax and a shipped one.
3. Drive the running app in Chrome and screenshot: cold load (grid draw), a
   placed mark with its shadow, hover ghost, AI thinking state, win sequence,
   reset sweep, difficulty switch.
4. Re-run the cold load with `prefers-reduced-motion: reduce` forced, confirming
   animation is suppressed and the app remains fully playable.
5. Mobile viewport check at 375px — the existing `@media (max-width: 768px)`
   rules resize the board to `90vw`, and the marks and shadows must scale with
   it.

---

## 8. Portfolio card art

**Delivered.** `dangervalentine.com` renders this project as a 16:9 card in a
dark grid alongside NextQuest, Density Fitness and the arcade games.

| | |
|---|---|
| File | `portfolio/public/projects/tic-tac-toe.webp` (overwrote the previous screenshot) |
| Output | 1280x720 WebP, quality 82, no alpha, 23,240 bytes |
| Render path | SVG composed at 2560x1440, rasterized with `sharp`, downscaled `lanczos3` — rendered large and reduced, never upscaled |
| `content/site.ts` | `image` unchanged (`/projects/tic-tac-toe.webp`); `imageAlt` rewritten to describe the new art |

Composition follows the arcade-game cards rather than the flagship product
cards: centered weight, wordmark above a hero subject, mint accent on the
`#011627` ground so the art fuses with the card band. The eyebrow reads
"MINIMAX SEARCH", the board shows a completed **draw**, and the line beneath
reads "YOU CANNOT WIN · YOU CAN ONLY DRAW" — the draw is the honest statement of
what a perfect opponent offers. A faint search tree of miniature boards branches
to scored leaves (`0`, `−1`) on both sides, filling the 16:9 width without
competing with the focal point.

Constraints honoured: 120px source margins (60px delivered) on all four edges,
the top-right 520x180 source region (260x90 delivered) left clear for the site's
category chip, and all text at or above 48px in the source.

**Dependency:** the art depicts the palette decided in section 2 — mint `#7fdbca`
X marks, coral `#FFAB70` O marks, and the cast shadows from section 4. If those
change during implementation, the card must be re-rendered to match. The
generator script is not currently committed; the portfolio repo has no
precedent for art generators in `scripts/`.

---

## 9. Addendum — added after approval

Requested mid-implementation, after sections 1-8 were approved. Built and
verified.

### 9.1 Shadows match the piece shape

Section 4 specified the cast shadow as an ellipse on its own animation curve.
The ellipse is replaced by **a second copy of the same glyph** — an X casts an
X, an O casts a ring — rendered in `background.floor`, blurred, offset down and
scaled on its own spring.

This keeps the property that mattered: the shadow is still a separate element
with its own transition, not a `filter: drop-shadow` welded to the mark, so it
still lags and spreads independently as the piece springs up. Only the silhouette
changed.

### 9.2 Two-player mode, and choosing your side

`mode` (`"cpu" | "human"`) and `humanPlayer` (`1 = X`, `2 = O`) join the state.

Turn ownership is generalised: X always moves first, so the player to move is
always `turn + 1`, and who *controls* that side is a separate question.

| Mode | Turn 0 (X) | Turn 1 (O) |
|---|---|---|
| `cpu`, human = X | human | AI |
| `cpu`, human = O | **AI opens** | human |
| `human` | human | human |

The AI effect fires only when `mode === "cpu"` and `turn + 1 === aiPlayer`.
Because `helper.js` scores X as the maximizing side, the AI passes
`maximizing: aiPlayer === 1` — the minimax is symmetric, so it plays either side
perfectly with no other change.

Changing any match setting (mode, side, difficulty) **starts a fresh game**
rather than leaving a half-played board owned by the wrong players.

### 9.3 UI consequences

- `DifficultyToggle.jsx` is replaced by a generic **`SegmentedToggle.jsx`**,
  used three times (mode, side, difficulty). Each instance needs its own
  `layoutId` or the sliding thumbs animate into one another.
- The side and difficulty toggles are hidden in two-player mode — neither means
  anything without an AI.
- `Result` is mode-aware: "You win" / "Computer wins" against the CPU, "X wins"
  / "O wins" in two-player, where neither side is "you".
- The hover ghost renders the mark of whoever is to move, so in two-player it
  alternates mint and coral.
- The turn dot is coloured by the side to move, and pulses amber only while the
  CPU is thinking.
- **Mobile regression fixed:** three toggles plus reset do not fit beside the
  title at 375px — the old header pushed them off-screen and wrapped the title
  onto three lines. The header now stacks into two rows below 768px and the
  controls wrap.

---

## Risks

| Risk | Mitigation |
|---|---|
| Pages source not flipped in repo settings | Called out explicitly in section 5; site silently keeps serving old content until done |
| `%PUBLIC_URL%` shipped literally | Caught by verification step 1 |
| React 19 StrictMode double-invoke surfacing the effect bug | Fixed directly in section 6 |
| 450ms AI delay feels sluggish | Single constant in `motion.js`; trivially reverted |
| Motion overshoot clipping at cell edges | Board and cells must not set `overflow: hidden`; shadows extend past mark bounds by design |
| Card art drifts from the implemented palette | Dependency recorded in section 8; re-render from the 2560x1440 source if mark colors or shadows change |
