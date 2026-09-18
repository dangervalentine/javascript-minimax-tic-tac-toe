# Night Owl Restyle + Motion Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate this 2019 CRA app to Vite + React 19 + `motion`, re-skin it in the Night Owl dark palette, and replace every instant state change with an animated one.

**Architecture:** `react-scripts` is replaced by Vite. Colors live only in CSS custom properties (`src/theme.css`); `motion` animates transform/opacity/filter and never color, so there is no second copy of the palette. The nine `background-image` pieces become inline SVG components that each carry a separately-animated cast-shadow element — that independence is what produces the sense of depth. Per-cell CSS borders become one SVG grid overlay so the board can draw itself in.

**Tech Stack:** Vite 6, React 19, `motion` v12, plain CSS custom properties. No CSS framework, no test runner.

**Spec:** `docs/superpowers/specs/2026-09-18-night-owl-restyle-design.md`

---

## Notes for the implementer

**No tests.** The user cut the test suite from scope. There is no `npm test`. Every task ends with a manual verification step instead — actually run it and actually look at it before moving on.

**No commits.** This repo's owner commits their own work. Do not run `git commit`, and do not ask to. Leave changes in the working tree.

**Two facts about `helper.js` that the code depends on.** Read them before Task 2:

1. **Cell values:** `1` = X = the human player. `2` = O = the AI. `isTerminal()` returns `{ winner, direction, row, pieces }` on a win, `{ winner: "draw", pieces: [] }` on a full board (note: **no `direction` key**), and `false` otherwise.
2. **Difficulty is inverted from what you would guess.** `new boardHelper(d)` sets `max_depth = d ? 2 : 6`. So **`difficulty === 0` is HARD** (searches 6 ply) and **`difficulty === 1` is EASY** (searches 2 ply). The app starts on `difficulty: 0`, i.e. hard. Label the toggle accordingly or you will ship it backwards.
3. **`getBestMove` can return a string.** At depth 0 it may return an element of `"3,5,7".split(",")`. Always wrap it in `Number()`.

**Two deliberate deviations from the spec.**

1. Spec section 3 gives `WinLine({ alignment, pieces })`. The implementation below takes `pieces` only — the line's angle is derivable from the first and last piece index, which makes `alignment` dead weight and removes the need to special-case `H`/`V`/`DL`/`DR`. The `winningAlignment` state field is kept (it costs nothing and the spec references it) but nothing reads it.
2. Spec section 2 maps grid lines to `neutral.darkGray` `#1d3b53`, the same token as the header border. At `#1d3b53` the lines nearly vanish against the `#0a1e30` board surface, so the plan gives grid lines their own token, `--nowl-grid: #2c4f6b`. The header border stays `#1d3b53` as specified. If you prefer the spec's value, change the one token — but look at it on screen first.

---

## File Structure

**Created:**

| File | Responsibility |
|---|---|
| `index.html` (repo root) | Vite entry document |
| `vite.config.js` | Vite + React plugin + gh-pages `base` |
| `src/theme.css` | The dark Night Owl palette as `--nowl-*` custom properties |
| `src/motion.js` | Every spring, duration and delay constant in one place |
| `src/Board.jsx` | Board container, grid overlay, cells, win line, result |
| `src/GridLines.jsx` | SVG grid overlay that draws itself in on load |
| `src/Cell.jsx` | One square: hover ghost + `AnimatePresence` around its mark |
| `src/Mark.jsx` | Inline `<Ex/>`/`<Oh/>` SVG + its cast-shadow element |
| `src/WinLine.jsx` | Stroked SVG line drawn through the winning triple |
| `src/Result.jsx` | Win/draw announcement |
| `src/DifficultyToggle.jsx` | Two-state toggle with a `layout`-animated thumb |
| `src/ResetButton.jsx` | Reset control with press feedback |
| `.github/workflows/deploy.yml` | Build and publish to GitHub Pages |

**Modified:** `package.json`, `src/App.js`→`App.jsx`, `src/index.js`→`index.jsx`, `src/Header.js`→`Header.jsx`, `src/App.css`, `src/index.css`, `public/manifest.json`

**Deleted:** `src/serviceWorker.js`, `src/App.test.js`, `src/ex.svg`, `src/oh.svg`, `src/difficulty.svg`, `public/index.html`

**Untouched:** `src/helper.js` (the minimax), `public/favicon.ico`, `public/logo*.png`, `public/robots.txt`

---

## Task 1: Vite + React 19 toolchain swap

**Files:**
- Create: `vite.config.js`, `index.html`
- Modify: `package.json`
- Rename: `src/index.js` → `src/index.jsx`, `src/App.js` → `src/App.jsx`, `src/Header.js` → `src/Header.jsx`, `src/Cell.js` → `src/Cell.jsx`
- Delete: `src/serviceWorker.js`, `src/App.test.js`, `public/index.html`

- [ ] **Step 1: Replace `package.json`**

```json
{
  "name": "javascript-minimax-tic-tac-toe",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "motion": "^12.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0"
  }
}
```

Note what left: `react-scripts`, `gh-pages`, the `homepage` field, the `eslintConfig` block and `browserslist`. `homepage` was CRA-only and pointed at the pre-rename `victoriousj.github.io`; `base` in Vite replaces it.

- [ ] **Step 2: Create `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/javascript-minimax-tic-tac-toe/',
})
```

The `base` value must stay exactly this — it reproduces the asset prefix the live site already serves, so no published URL changes.

- [ ] **Step 3: Create `index.html` at the repo root**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#011627" />
    <meta
      name="description"
      content="Tic-tac-toe against a minimax opponent that cannot lose."
    />
    <link rel="apple-touch-icon" href="/logo192.png" />
    <link rel="manifest" href="/manifest.json" />
    <title>Tic Tac Toe</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="/src/index.jsx"></script>
  </body>
</html>
```

Three corrections are baked in here. `%PUBLIC_URL%` is a CRA build-time placeholder — Vite does not substitute it, so leaving it would ship the literal string and 404 the favicon and manifest. `apple-touch-icon` gains its missing leading slash (without it the path resolves against the page URL, not the base — already subtly broken on the live site). `theme-color` moves to the palette ground.

- [ ] **Step 4: Delete the CRA leftovers**

```bash
rm public/index.html src/serviceWorker.js src/App.test.js
```

Deleting `serviceWorker.js` is safe: `src/index.js` calls `serviceWorker.unregister()`, never `register()`, so no visitor has ever had a service worker installed and there is no cached-asset migration to perform.

- [ ] **Step 5: Rename the JSX files**

```bash
git mv src/index.js src/index.jsx
git mv src/App.js src/App.jsx
git mv src/Header.js src/Header.jsx
git mv src/Cell.js src/Cell.jsx
```

Vite will not transform JSX inside a `.js` file. Every file containing JSX must be `.jsx`.

- [ ] **Step 6: Rewrite `src/index.jsx` for React 19**

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";

import App from "./App";
import "./theme.css";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>
);
```

`theme.css` does not exist yet — it arrives in Task 3. Create an empty `src/theme.css` now so this import resolves:

```bash
touch src/theme.css
```

`MotionConfig reducedMotion="user"` is what makes every animation in this plan honour `prefers-reduced-motion` without a single per-component check.

- [ ] **Step 7: Install and run**

```bash
npm install
npm run dev
```

Expected: Vite prints a local URL and the app loads. **It will look exactly like the old app** — same colors, same cyan X, same magenta O. That is the point of this task: prove the toolchain swap is behaviourally neutral before changing a single visual.

Expect one visible problem: the AI may now play two moves at once, or the board may behave erratically. That is the pre-existing `useEffect` bug surfacing under React 19 StrictMode, and Task 2 fixes it. Do not chase it here.

- [ ] **Step 8: Verify the production build**

```bash
npm run build && npm run preview
```

Open the preview URL and confirm the app renders with no 404s in the Network tab. This is the check that catches a surviving `%PUBLIC_URL%`.

---

## Task 2: Fix the two pre-existing bugs in App.jsx

Both are load-bearing for everything that follows: `AnimatePresence` keys off state identity, so accidental array sharing and duplicate effect runs produce dropped exit animations that look like random bugs later.

**Files:**
- Modify: `src/App.jsx` (full rewrite of the component body)

- [ ] **Step 1: Replace the whole of `src/App.jsx`**

```jsx
import React from "react";

import Header from "./Header";
import Cell from "./Cell";

import { initialBoard, boardHelper } from "./helper";
import "./App.css";

const initialState = {
  winningAlignment: "",
  winningPieces: [],
  cells: initialBoard,
  isPlaying: true,
  difficulty: 0,
  winner: "",
  turn: 0
};

// The AI's think time. Task 13 raises this to 450ms so the thinking pulse has
// time to register; it stays at the original 200 until then.
const AI_MOVE_DELAY = 200;

function App() {
  const [state, setState] = React.useState({ ...initialState });

  // Applies a finished board to state and, if that board ended the game,
  // records the outcome in the same update.
  const commit = React.useCallback(cells => {
    const outcome = new boardHelper().isTerminal(cells);
    setState(prev => ({
      ...prev,
      cells,
      turn: (prev.turn + 1) % 2,
      ...(outcome
        ? {
            // A draw returns no `direction` key, so default it.
            winningAlignment: outcome.direction || "",
            winningPieces: outcome.pieces,
            winner: outcome.winner,
            isPlaying: false
          }
        : {})
    }));
  }, []);

  function insert(i) {
    if (!state.isPlaying || state.turn !== 0 || state.cells[i] !== 0) return;
    const cells = [...state.cells];
    cells[i] = 1;
    commit(cells);
  }

  React.useEffect(() => {
    if (!state.isPlaying || state.turn !== 1) return;

    const timer = window.setTimeout(() => {
      const helper = new boardHelper(state.difficulty);
      // getBestMove can return a string index; Number() it.
      const move = Number(helper.getBestMove(state.cells, false));
      if (state.cells[move] !== 0) return;
      const cells = [...state.cells];
      cells[move] = 2;
      commit(cells);
    }, AI_MOVE_DELAY);

    return () => window.clearTimeout(timer);
  }, [state.turn, state.isPlaying, state.cells, state.difficulty, commit]);

  function resetGame() {
    setState(prev => ({ ...initialState, difficulty: prev.difficulty }));
  }

  function handleBoardClick() {
    if (!state.isPlaying) resetGame();
  }

  function toggleDifficulty() {
    setState(prev => ({ ...prev, difficulty: (prev.difficulty + 1) % 2 }));
  }

  return (
    <div>
      <Header
        resetGame={resetGame}
        toggleDifficulty={toggleDifficulty}
        difficulty={state.difficulty}
      />
      <div
        onClick={handleBoardClick}
        className={`board ${state.isPlaying ? "active" : ""}`}
      >
        {state.cells.map((cell, i) => (
          <Cell
            key={i}
            index={i}
            value={cell}
            insert={insert}
            winningAlignment={state.winningAlignment}
            winningPeice={state.winningPieces.indexOf(i) >= 0}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
```

What changed and why:

- **The effect now has a dependency array.** It previously had none, so it re-ran after *every* render and queued a fresh `setTimeout` each time. The cleanup function cancelling the timer is the in-flight guard — under StrictMode's double-invoke, run 1's timer is cleared before run 2 sets its own, so exactly one AI move is ever scheduled.
- **`enemyGo` mutated the array held in state.** Both paths now copy before writing, so every board is a fresh array and React can actually tell old state from new.
- The two duplicated `isTerminal` blocks collapse into `commit`.
- `winningPeices` (misspelled) becomes `winningPieces`. The `Cell` prop `winningPeice` keeps its original spelling for now — Task 6 replaces `Cell` wholesale.

- [ ] **Step 2: Verify**

Run `npm run dev`. Play a full game on the default difficulty (which is **hard**). Confirm:
- The AI plays exactly one move per turn — no double moves, no skipped turns.
- You cannot win. Best case is a draw.
- Clicking the board after the game ends starts a new one.
- The browser console is free of React warnings.

---

## Task 3: The palette

**Files:**
- Modify: `src/theme.css` (created empty in Task 1), `src/index.css`

- [ ] **Step 1: Write `src/theme.css`**

```css
/* Night Owl — dark. The single source of colour for this app.
   Nothing animates colour, so these values never need a JS twin. */
:root {
  /* primary / secondary */
  --nowl-primary-light: #afc6ff;
  --nowl-primary: #82aaff;
  --nowl-primary-dark: #4976a1;
  --nowl-secondary-light: #a3b7c7;
  --nowl-secondary: #8da0af;
  --nowl-secondary-dark: #2a3f51;

  /* accents */
  --nowl-cyan: #7fdbca;
  --nowl-coral: #ffab70;
  --nowl-green: #c3e88d;
  --nowl-pink: #f07178;
  --nowl-yellow: #ffcb6b;
  --nowl-purple: #c792ea;

  /* status */
  --nowl-status-playing: #d4a44e;

  /* neutrals */
  --nowl-white: #ffffff;
  --nowl-light-gray: #d6deeb;
  --nowl-gray: #637777;
  --nowl-dark-gray: #1d3b53;

  /* backgrounds */
  --nowl-bg-elevated: #132a3e;
  --nowl-bg-surface: #0a1e30;
  --nowl-bg-base: #011627;
  --nowl-bg-floor: #010e18;
  --nowl-scrim: rgba(1, 22, 39, 0.6);

  /* text */
  --nowl-text: #d6deeb;
  --nowl-text-secondary: #9db2c0;
  --nowl-text-muted: #7e8e94;

  /* semantic roles used by this app */
  --nowl-x: var(--nowl-cyan);
  --nowl-o: var(--nowl-coral);
  --nowl-grid: #2c4f6b;
  --nowl-border: var(--nowl-dark-gray);
}
```

- [ ] **Step 2: Replace `src/index.css`**

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

The `code` rule goes — nothing in this app renders code. `box-sizing` moves here from `App.css` so the reset lives in one file.

- [ ] **Step 3: Verify**

`npm run dev`. Nothing should look different yet — `App.css` still wins on every property that matters. Confirm the app still renders and the console is clean. If the page suddenly lost its dark background, `theme.css` is not being imported; check Task 1 Step 6.

---

## Task 4: Static restyle

This task changes how the app looks but nothing about how it behaves. The pieces stay as `background-image` SVGs until Task 6.

**Files:**
- Modify: `src/App.css` (full replacement)

- [ ] **Step 1: Replace `src/App.css` entirely**

```css
html {
  height: 100%;
}

body {
  background: var(--nowl-bg-base);
  color: var(--nowl-text);
}

/* ---- header ---------------------------------------------------------- */

header {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px solid var(--nowl-border);
  background-color: var(--nowl-bg-elevated);
  text-align: left;
}

.app-info {
  display: flex;
  align-items: center;
}

.title {
  font-size: 1.75rem;
  color: var(--nowl-white);
  letter-spacing: 0.01em;
}

.credit {
  font-size: 0.7rem;
  color: var(--nowl-text-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}

.credit:hover {
  color: var(--nowl-text-secondary);
}

.header-text {
  margin: 0 12px;
}

.header-text p {
  margin-block-start: 0;
  margin-block-end: 0;
}

.logo {
  display: inline-block;
  height: 50px;
  width: 50px;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ---- buttons --------------------------------------------------------- */

.reset-button {
  border-radius: 8px;
  border: 1px solid var(--nowl-secondary-dark);
  font-size: 1rem;
  letter-spacing: 0.04em;
  padding: 0 16px;
  height: 44px;
  background-color: transparent;
  color: var(--nowl-text-secondary);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.reset-button:hover,
.reset-button:focus-visible {
  border-color: var(--nowl-primary);
  color: var(--nowl-text);
  outline: none;
}

/* ---- board ----------------------------------------------------------- */

.board {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  height: 65vh;
  width: 65vh;
  margin: 3vh auto 0;
  background: var(--nowl-bg-surface);
  border: 1px solid var(--nowl-border);
  border-radius: 14px;
}

.cell {
  position: relative;
  height: 33.333%;
  width: 33.333%;
  font-size: 15vh;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px solid var(--nowl-grid);
}

.cell:nth-of-type(3n + 1) {
  border-left: none;
}

.cell:nth-of-type(1),
.cell:nth-of-type(2),
.cell:nth-of-type(3) {
  border-top: none;
}

.cell:nth-of-type(3n + 3) {
  border-right: none;
}

.cell:nth-of-type(7),
.cell:nth-of-type(8),
.cell:nth-of-type(9) {
  border-bottom: none;
}

.board.active .cell:hover {
  background: rgba(127, 219, 202, 0.05);
  cursor: pointer;
}

.cell span.ex,
.cell span.oh {
  position: absolute;
  height: 50%;
  width: 50%;
  background-size: cover;
}

.cell span.ex {
  background-image: url(./ex.svg);
}

.cell span.oh {
  background-image: url(./oh.svg);
}

/* ---- responsive ------------------------------------------------------ */

@media (max-width: 768px) {
  html {
    overflow-x: hidden;
  }

  .board {
    margin: 6vh auto;
    height: 90vw;
    width: 90vw;
  }
}
```

Deleted in this pass: the four `.cell.DR/.DL/.H/.V` win-line gradients (Task 8 replaces them with a real line), the `.difficulty-button` sprite rules (Task 11 replaces the control), the `.result` block (Task 9 rebuilds it), the `.cell span { z-index: -1 }` rule that was rendering pieces *behind* the board, and the mobile scrollbar hacks including a stray `#ff0000` thumb that was never on any palette.

The per-cell borders survive this task only so the board stays visible; Task 7 replaces them with the SVG overlay.

- [ ] **Step 2: Verify**

`npm run dev`. The app should now read as Night Owl: `#011627` page, raised header, muted credit link, a surfaced board panel with `#2c4f6b` grid lines. The X and O are still the old hardcoded `#00FFFF` cyan — they are `background-image` SVGs that CSS cannot recolor, and Task 6 is what fixes that. Confirm the header buttons still work and the difficulty sprite still slides (it will look wrong; that is expected until Task 11).

---

## Task 5: Motion constants

**Files:**
- Create: `src/motion.js`

- [ ] **Step 1: Create `src/motion.js`**

```js
// Every timing value in the app. One file so the seven interactions feel like
// one system, and so a single edit can retune the whole thing.

// The AI's think time. The original was 200ms, which is too short for the
// thinking pulse to register as anything but a flicker. Revert to 200 if the
// slower pace feels sluggish — nothing else depends on this value.
export const AI_MOVE_DELAY = 450;

// A mark springing up off the board. Visible overshoot is intentional.
export const MARK_SPRING = {
  type: "spring",
  stiffness: 500,
  damping: 22,
  mass: 0.8
};

// The cast shadow, deliberately on its own curve and slightly behind the mark.
// That independence is what reads as depth.
export const SHADOW_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 26,
  delay: 0.04
};

export const GRID_DRAW = { duration: 0.5, ease: [0.65, 0, 0.35, 1] };
export const GRID_STAGGER = 0.08;

export const GHOST = { duration: 0.15, ease: "easeOut" };

export const WIN_LINE = { duration: 0.45, ease: [0.65, 0, 0.35, 1] };

// Delayed so the result lands after the win line finishes drawing.
export const RESULT_SPRING = {
  type: "spring",
  stiffness: 300,
  damping: 24,
  delay: 0.45
};

export const RESET_STAGGER = 0.03;
export const RESET_EXIT = { duration: 0.2, ease: "easeIn" };

export const THINKING_PULSE = {
  duration: 1.2,
  repeat: Infinity,
  ease: "easeInOut"
};

export const INTRO = { duration: 0.4, ease: "easeOut" };
```

- [ ] **Step 2: Wire the AI delay to it**

In `src/App.jsx`, delete the local `AI_MOVE_DELAY` constant and its comment, and import the shared one:

```jsx
import { AI_MOVE_DELAY } from "./motion";
```

- [ ] **Step 3: Verify**

`npm run dev`, play one move. The AI should now visibly pause before replying — roughly half a second rather than the near-instant response. Nothing else changes.

---

## Task 6: Inline marks with cast shadows

The payload task. Replaces the `background-image` pieces with inline SVG that takes its colour from CSS, and gives each mark a shadow that animates independently.

**Files:**
- Create: `src/Mark.jsx`
- Replace: `src/Cell.jsx`
- Modify: `src/App.css` (append), `src/App.jsx` (props)
- Delete: `src/ex.svg`, `src/oh.svg`

- [ ] **Step 1: Create `src/Mark.jsx`**

```jsx
import React from "react";
import { motion } from "motion/react";

import { MARK_SPRING, SHADOW_SPRING, RESET_STAGGER, RESET_EXIT } from "./motion";

// Geometry only. Colour comes from `currentColor`, set by the .x / .o class.
export function Glyph({ player }) {
  if (player === 1) {
    return (
      <svg viewBox="0 0 100 100" className="glyph" aria-hidden="true">
        <line x1="18" y1="18" x2="82" y2="82" />
        <line x1="82" y1="18" x2="18" y2="82" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className="glyph" aria-hidden="true">
      <circle cx="50" cy="50" r="32" />
    </svg>
  );
}

export default function Mark({ player, index, isWinner, isLoser }) {
  return (
    <>
      <motion.span
        className="mark-shadow"
        initial={{ scaleX: 0.3, opacity: 0 }}
        animate={{
          scaleX: isWinner ? 1.25 : 1,
          opacity: isLoser ? 0.3 : isWinner ? 0.85 : 0.75
        }}
        exit={{
          scaleX: 0.3,
          opacity: 0,
          transition: { ...RESET_EXIT, delay: index * RESET_STAGGER }
        }}
        transition={SHADOW_SPRING}
      />
      <motion.span
        className={`mark ${player === 1 ? "x" : "o"}`}
        initial={{ scale: 0 }}
        animate={{
          scale: isWinner ? 1.08 : 1,
          y: isWinner ? "-6%" : "0%",
          opacity: isLoser ? 0.35 : 1,
          filter: isLoser ? "grayscale(0.8)" : "grayscale(0)"
        }}
        exit={{
          scale: 0,
          transition: { ...RESET_EXIT, delay: index * RESET_STAGGER }
        }}
        transition={MARK_SPRING}
      >
        <Glyph player={player} />
      </motion.span>
    </>
  );
}
```

`isWinner` and `isLoser` are wired here but stay `false` until Task 14 — building them in now avoids a second pass over this file.

- [ ] **Step 2: Replace `src/Cell.jsx`**

```jsx
import React from "react";
import { AnimatePresence } from "motion/react";

import Mark from "./Mark";

export default function Cell({
  index,
  value,
  interactive,
  isWinner,
  isLoser,
  onInsert
}) {
  return (
    <div
      className={`cell ${interactive ? "interactive" : ""}`}
      onClick={() => interactive && onInsert(index)}
    >
      <AnimatePresence>
        {value !== 0 && (
          <Mark
            key="mark"
            player={value}
            index={index}
            isWinner={isWinner}
            isLoser={isLoser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 3: Update the `Cell` call site in `src/App.jsx`**

Replace the `state.cells.map(...)` block with:

```jsx
{state.cells.map((cell, i) => (
  <Cell
    key={i}
    index={i}
    value={cell}
    interactive={state.isPlaying && state.turn === 0}
    isWinner={state.winningPieces.indexOf(i) >= 0}
    isLoser={false}
    onInsert={insert}
  />
))}
```

`isLoser` is hardcoded `false` until Task 14.

- [ ] **Step 4: Append the mark styles to `src/App.css`**

Delete the `.cell span.ex` / `.cell span.oh` rules added in Task 4, and append:

```css
/* ---- marks ----------------------------------------------------------- */

.mark {
  position: absolute;
  top: 25%;
  left: 25%;
  width: 50%;
  height: 50%;
  display: block;
  pointer-events: none;
}

.mark.x {
  color: var(--nowl-x);
}

.mark.o {
  color: var(--nowl-o);
}

.glyph {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.glyph line,
.glyph circle {
  fill: none;
  stroke: currentColor;
  stroke-width: 11;
  stroke-linecap: round;
}

/* A separate element, not a filter: drop-shadow. Being separate is what lets
   it animate on its own curve and read as a shadow cast on the board. */
.mark-shadow {
  position: absolute;
  left: 28%;
  bottom: 17%;
  width: 44%;
  height: 7%;
  border-radius: 50%;
  background: var(--nowl-bg-floor);
  filter: blur(7px);
  pointer-events: none;
}
```

- [ ] **Step 5: Delete the dead assets**

```bash
rm src/ex.svg src/oh.svg
```

- [ ] **Step 6: Verify**

`npm run dev`. Play several moves and confirm:
- X marks are mint `#7fdbca`, O marks are coral `#ffab70`.
- Each mark **springs up with a visible overshoot** rather than appearing.
- Each mark has a soft dark ellipse beneath it that widens as the mark lands, a beat behind it.
- Nothing is clipped at cell edges. If a mark is cut off, something has `overflow: hidden` — remove it.

---

## Task 7: The grid that draws itself in

**Files:**
- Create: `src/GridLines.jsx`, `src/Board.jsx`
- Modify: `src/App.jsx`, `src/App.css`

- [ ] **Step 1: Create `src/GridLines.jsx`**

```jsx
import React from "react";
import { motion } from "motion/react";

import { GRID_DRAW, GRID_STAGGER } from "./motion";

const THIRD = 100 / 3;

const LINES = [
  { x1: THIRD, y1: 4, x2: THIRD, y2: 96 },
  { x1: THIRD * 2, y1: 4, x2: THIRD * 2, y2: 96 },
  { x1: 4, y1: THIRD, x2: 96, y2: THIRD },
  { x1: 4, y1: THIRD * 2, x2: 96, y2: THIRD * 2 }
];

export default function GridLines() {
  return (
    <svg
      className="grid-lines"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {LINES.map((line, i) => (
        <motion.line
          key={i}
          {...line}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ ...GRID_DRAW, delay: i * GRID_STAGGER }}
        />
      ))}
    </svg>
  );
}
```

- [ ] **Step 2: Create `src/Board.jsx`**

```jsx
import React from "react";
import { motion } from "motion/react";

import Cell from "./Cell";
import GridLines from "./GridLines";
import { INTRO } from "./motion";

export default function Board({
  cells,
  isPlaying,
  turn,
  winningPieces,
  onInsert,
  onReset
}) {
  const interactive = isPlaying && turn === 0;

  return (
    <motion.div
      className={`board ${interactive ? "active" : ""}`}
      onClick={() => !isPlaying && onReset()}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={INTRO}
    >
      <GridLines />
      {cells.map((value, i) => (
        <Cell
          key={i}
          index={i}
          value={value}
          interactive={interactive}
          isWinner={winningPieces.indexOf(i) >= 0}
          isLoser={false}
          onInsert={onInsert}
        />
      ))}
    </motion.div>
  );
}
```

- [ ] **Step 3: Use it in `src/App.jsx`**

Replace the `import Cell from "./Cell";` line with `import Board from "./Board";`, and replace the entire `<div className={...board...}>...</div>` block in the return with:

```jsx
<Board
  cells={state.cells}
  isPlaying={state.isPlaying}
  turn={state.turn}
  winningPieces={state.winningPieces}
  onInsert={insert}
  onReset={resetGame}
/>
```

`handleBoardClick` is now dead — delete it.

- [ ] **Step 4: Swap the cell borders for the overlay in `src/App.css`**

Delete all four `.cell:nth-of-type(...)` rules and the `border: 3px solid var(--nowl-grid);` line from `.cell`. Then append:

```css
.grid-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.grid-lines line {
  stroke: var(--nowl-grid);
  stroke-width: 3;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
```

`vector-effect: non-scaling-stroke` is required — without it `preserveAspectRatio="none"` would stretch the stroke width along with the geometry.

- [ ] **Step 5: Add the header intro in `src/Header.jsx`**

Change `import React from "react";` to also import motion, change the opening `<header>` tag to `<motion.header>` and the closing tag to `</motion.header>`, and give it the intro:

```jsx
import { motion } from "motion/react";
import { INTRO } from "./motion";

// ...

<motion.header
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={INTRO}
>
```

- [ ] **Step 6: Verify**

Reload the page. The four grid lines should **draw themselves outward from nothing**, staggered, while the header slides down and the board scales up from 0.98. Reload several times — the sequence should be identical every time. Confirm the lines land exactly on the cell boundaries; if they are offset, the board is not square and `preserveAspectRatio` needs revisiting.

---

## Task 8: The win line

**Files:**
- Create: `src/WinLine.jsx`
- Modify: `src/Board.jsx`, `src/App.css`

- [ ] **Step 1: Create `src/WinLine.jsx`**

```jsx
import React from "react";
import { AnimatePresence, motion } from "motion/react";

import { WIN_LINE } from "./motion";

const THIRD = 100 / 3;

// Centre of cell `i` in the 0-100 viewBox.
function centre(i) {
  return {
    x: (i % 3) * THIRD + THIRD / 2,
    y: Math.floor(i / 3) * THIRD + THIRD / 2
  };
}

export default function WinLine({ pieces }) {
  const show = pieces && pieces.length === 3;

  let geom = null;
  if (show) {
    const a = centre(pieces[0]);
    const b = centre(pieces[2]);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    // Overshoot each end so the line reads as struck through the row.
    const ex = (dx / len) * 9;
    const ey = (dy / len) * 9;
    geom = { x1: a.x - ex, y1: a.y - ey, x2: b.x + ex, y2: b.y + ey };
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.svg
          key="winline"
          className="win-line"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <motion.line
            {...geom}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            exit={{ pathLength: 0 }}
            transition={WIN_LINE}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  );
}
```

A draw yields `pieces: []`, so `show` is false and no line renders — correct.

- [ ] **Step 2: Render it in `src/Board.jsx`**

Add `import WinLine from "./WinLine";` and place it immediately after the `cells.map(...)` block, still inside `<motion.div className="board">`:

```jsx
<WinLine pieces={winningPieces} />
```

- [ ] **Step 3: Style it in `src/App.css`**

```css
.win-line {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.win-line line {
  stroke: var(--nowl-text);
  stroke-width: 6;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
```

- [ ] **Step 4: Verify**

Switch to easy mode in the browser by editing `difficulty: 0` to `difficulty: 1` in `initialState` temporarily, then beat the AI. The line should draw through the winning three from one end to the other, overshooting slightly at both ends. Test a vertical, a horizontal and a diagonal win. Restore `difficulty: 0` when done.

---

## Task 9: The result announcement

The `.result` class was fully styled in the original `App.css` and `state.winner` was always set, but nothing ever rendered it — the win had no payoff on screen.

**Files:**
- Create: `src/Result.jsx`
- Modify: `src/Board.jsx`, `src/App.jsx`, `src/App.css`

- [ ] **Step 1: Create `src/Result.jsx`**

```jsx
import React from "react";
import { AnimatePresence, motion } from "motion/react";

import { RESULT_SPRING } from "./motion";

// winner: 1 = the human (X), 2 = the AI (O), "draw" = full board.
function describe(winner) {
  if (winner === 1) return { text: "You win", tone: "x" };
  if (winner === 2) return { text: "Computer wins", tone: "o" };
  if (winner === "draw") return { text: "Draw", tone: "muted" };
  return null;
}

export default function Result({ winner, isPlaying }) {
  const outcome = isPlaying ? null : describe(winner);

  return (
    <AnimatePresence>
      {outcome && (
        <motion.div
          key="result"
          className={`result ${outcome.tone}`}
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
          transition={RESULT_SPRING}
        >
          <p className="result-text">{outcome.text}</p>
          <p className="result-hint">click the board to play again</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Render it from `src/Board.jsx`**

`Result` sits outside the board square, so wrap the board. Change `Board`'s signature to accept `winner`, and restructure its return:

```jsx
export default function Board({
  cells,
  isPlaying,
  turn,
  winner,
  winningPieces,
  onInsert,
  onReset
}) {
  const interactive = isPlaying && turn === 0;

  return (
    <div className="board-wrap">
      <motion.div
        className={`board ${interactive ? "active" : ""}`}
        onClick={() => !isPlaying && onReset()}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={INTRO}
      >
        <GridLines />
        {cells.map((value, i) => (
          <Cell
            key={i}
            index={i}
            value={value}
            interactive={interactive}
            isWinner={winningPieces.indexOf(i) >= 0}
            isLoser={false}
            onInsert={onInsert}
          />
        ))}
        <WinLine pieces={winningPieces} />
      </motion.div>
      <Result winner={winner} isPlaying={isPlaying} />
    </div>
  );
}
```

Add `import Result from "./Result";` at the top.

- [ ] **Step 3: Pass `winner` from `src/App.jsx`**

Add `winner={state.winner}` to the `<Board ... />` call.

- [ ] **Step 4: Style it in `src/App.css`**

```css
.board-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result {
  text-align: center;
  margin-top: 2.5vh;
}

.result-text {
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0;
}

.result.x .result-text {
  color: var(--nowl-x);
}

.result.o .result-text {
  color: var(--nowl-o);
}

.result.muted .result-text {
  color: var(--nowl-text-muted);
}

.result-hint {
  font-size: 0.8rem;
  color: var(--nowl-text-muted);
  margin: 6px 0 0;
  letter-spacing: 0.04em;
}
```

- [ ] **Step 5: Verify**

Play to a draw on hard. "Draw" should spring in **after** the board settles, in muted grey. Temporarily set `difficulty: 1` and win — "You win" appears in mint, and the win line finishes drawing before the text lands. Lose deliberately — "Computer wins" in coral.

---

## Task 10: Header controls

**Files:**
- Create: `src/ResetButton.jsx`
- Modify: `src/Header.jsx`, `src/App.css`

- [ ] **Step 1: Create `src/ResetButton.jsx`**

```jsx
import React from "react";
import { motion } from "motion/react";

export default function ResetButton({ onReset }) {
  return (
    <motion.button
      type="button"
      className="reset-button"
      onClick={onReset}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.12 }}
    >
      reset ↺
    </motion.button>
  );
}
```

- [ ] **Step 2: Add the turn indicator and the reset button to `src/Header.jsx`**

Replace the whole file:

```jsx
import React from "react";
import { motion } from "motion/react";

import logo from "./logo.svg";
import ResetButton from "./ResetButton";
import DifficultyToggle from "./DifficultyToggle";
import { INTRO, THINKING_PULSE } from "./motion";

export default function Header({
  resetGame,
  toggleDifficulty,
  difficulty,
  thinking
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={INTRO}
    >
      <div className="app-info">
        <img className="logo" src={logo} alt="Minimax Tic Tac Toe logo" />
        <div className="header-text">
          <p className="title">Tic Tac Toe</p>
          <a
            target="_blank"
            className="credit"
            rel="noopener noreferrer"
            href="https://github.com/dangervalentine"
          >
            <p>by victor d. johnson</p>
          </a>
        </div>
        <motion.span
          className="turn-dot"
          aria-hidden="true"
          animate={
            thinking
              ? { opacity: [1, 0.35, 1], scale: [1, 0.85, 1] }
              : { opacity: 0, scale: 1 }
          }
          transition={thinking ? THINKING_PULSE : { duration: 0.2 }}
        />
      </div>
      <div className="header-buttons">
        <DifficultyToggle difficulty={difficulty} onToggle={toggleDifficulty} />
        <ResetButton onReset={resetGame} />
      </div>
    </motion.header>
  );
}
```

The credit link's host is corrected here: the account was renamed `victoriousj` → `dangervalentine`, and while GitHub's redirect keeps the old URL alive, it is user-visible and stale.

`DifficultyToggle` does not exist until Task 11 — the app will not compile until that task is done. Do Task 11 next.

- [ ] **Step 3: Style the turn dot in `src/App.css`**

```css
.turn-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--nowl-status-playing);
  margin-left: 4px;
  align-self: center;
}
```

---

## Task 11: Difficulty toggle

Remember: **`difficulty === 0` is hard, `difficulty === 1` is easy.** Shipping these labels backwards is the single easiest mistake to make in this plan.

**Files:**
- Create: `src/DifficultyToggle.jsx`
- Modify: `src/App.css`
- Delete: `src/difficulty.svg`

- [ ] **Step 1: Create `src/DifficultyToggle.jsx`**

```jsx
import React from "react";
import { motion } from "motion/react";

import { MARK_SPRING } from "./motion";

// helper.js: max_depth = difficulty ? 2 : 6. Deeper search = harder opponent,
// so 0 is HARD and 1 is EASY. Not a typo.
const OPTIONS = [
  { value: 0, label: "HARD" },
  { value: 1, label: "EASY" }
];

export default function DifficultyToggle({ difficulty, onToggle }) {
  return (
    <button
      type="button"
      className="difficulty-toggle"
      onClick={onToggle}
      aria-label={`Difficulty: ${difficulty ? "easy" : "hard"}. Click to switch.`}
    >
      {OPTIONS.map(option => {
        const on = option.value === difficulty;
        return (
          <span
            key={option.value}
            className={`difficulty-option ${on ? "on" : ""}`}
          >
            {on && (
              <motion.span
                layoutId="difficulty-thumb"
                className="difficulty-thumb"
                transition={MARK_SPRING}
              />
            )}
            <span className="difficulty-label">{option.label}</span>
          </span>
        );
      })}
    </button>
  );
}
```

`layoutId` is what makes the thumb *slide* between the two options rather than disappearing and reappearing — `motion` matches the two elements across renders because they share the id.

- [ ] **Step 2: Style it in `src/App.css`**

```css
.difficulty-toggle {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 44px;
  padding: 3px;
  border: 1px solid var(--nowl-secondary-dark);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.difficulty-toggle:hover,
.difficulty-toggle:focus-visible {
  border-color: var(--nowl-primary);
  outline: none;
}

.difficulty-option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 12px;
  border-radius: 6px;
}

.difficulty-thumb {
  position: absolute;
  inset: 0;
  border-radius: 6px;
  background: var(--nowl-secondary-dark);
}

.difficulty-label {
  position: relative;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: var(--nowl-text-muted);
  transition: color 0.2s ease;
}

.difficulty-option.on .difficulty-label {
  color: var(--nowl-text);
}
```

- [ ] **Step 3: Delete the sprite**

```bash
rm src/difficulty.svg
```

- [ ] **Step 4: Pass `thinking` into the header from `src/App.jsx`**

```jsx
<Header
  resetGame={resetGame}
  toggleDifficulty={toggleDifficulty}
  difficulty={state.difficulty}
  thinking={state.isPlaying && state.turn === 1}
/>
```

- [ ] **Step 5: Verify**

`npm run dev`. The toggle should show HARD and EASY with the thumb behind HARD on load. Click it — the thumb **slides** to EASY and the active label brightens. Confirm EASY actually plays worse: you should be able to beat it, and you should not be able to beat HARD. Press the reset button and confirm it dips slightly under the press.

---

## Task 12: Hover ghost

**Files:**
- Modify: `src/Cell.jsx`, `src/App.css`

- [ ] **Step 1: Add the ghost to `src/Cell.jsx`**

```jsx
import React from "react";
import { AnimatePresence, motion } from "motion/react";

import Mark, { Glyph } from "./Mark";
import { GHOST } from "./motion";

const GHOST_VARIANTS = {
  rest: { opacity: 0, scale: 0.9 },
  hover: { opacity: 0.18, scale: 0.95 }
};

export default function Cell({
  index,
  value,
  interactive,
  isWinner,
  isLoser,
  onInsert
}) {
  const showGhost = interactive && value === 0;

  return (
    <motion.div
      className={`cell ${interactive ? "interactive" : ""}`}
      onClick={() => interactive && onInsert(index)}
      initial="rest"
      whileHover={showGhost ? "hover" : "rest"}
    >
      <AnimatePresence>
        {value !== 0 && (
          <Mark
            key="mark"
            player={value}
            index={index}
            isWinner={isWinner}
            isLoser={isLoser}
          />
        )}
      </AnimatePresence>
      {showGhost && (
        <motion.span
          className="mark x ghost"
          variants={GHOST_VARIANTS}
          transition={GHOST}
        >
          <Glyph player={1} />
        </motion.span>
      )}
    </motion.div>
  );
}
```

The variant lives on the cell and propagates to the ghost child, which is why the ghost can be `pointer-events: none` and still respond to hovering anywhere in the square.

- [ ] **Step 2: Gate it to real pointers in `src/App.css`**

```css
.ghost {
  display: none;
}

@media (hover: hover) {
  .ghost {
    display: block;
  }
}
```

Touch devices synthesise hover events on tap, which would leave a ghost stuck under the finger. The media query removes the element entirely rather than relying on JS.

- [ ] **Step 3: Verify**

Hover an empty cell on your turn — a faint mint X fades in, and out when you leave. Confirm it does **not** appear: over occupied cells, during the AI's turn, or after the game ends. Then open devtools' device toolbar, switch to a touch device, and confirm no ghost appears on tap.

---

## Task 13: AI thinking pulse

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Dim the board while the AI thinks**

In `src/Board.jsx`, add the thinking state to the board's `animate`:

```jsx
<motion.div
  className={`board ${interactive ? "active" : ""}`}
  onClick={() => !isPlaying && onReset()}
  initial={{ opacity: 0, scale: 0.98 }}
  animate={{ opacity: isPlaying && turn === 1 ? 0.92 : 1, scale: 1 }}
  transition={INTRO}
>
```

- [ ] **Step 2: Verify**

Make a move. During the AI's ~450ms think time the board should dim slightly and the amber dot beside the title should pulse on a slow 1.2s loop. When the AI plays, the dot fades out and the board returns to full strength. Confirm the pulse does not continue after the game ends.

If the pulse is too subtle to notice, the delay is doing its job but the dot is too small — raise `.turn-dot` to 11px rather than lengthening the delay further.

---

## Task 14: Win sequence

**Files:**
- Modify: `src/Board.jsx`

- [ ] **Step 1: Compute the losing marks**

In `src/Board.jsx`, replace the hardcoded `isLoser={false}` with a real value. Add above the `return`:

```jsx
const hasWinner = !isPlaying && winningPieces.length === 3;
```

and in the `cells.map`:

```jsx
isLoser={hasWinner && winningPieces.indexOf(i) < 0 && value !== 0}
```

A draw has `winningPieces.length === 0`, so `hasWinner` is false and nothing desaturates — correct, because in a draw nobody lost.

- [ ] **Step 2: Verify**

Temporarily set `difficulty: 1` in `initialState` and win a game. The three winning marks should lift, scale up slightly and cast a larger shadow, while every other mark drops to 35% opacity and desaturates. The win line draws through them, then the result springs in. Lose a game and confirm the same treatment runs with the roles reversed. Play to a draw and confirm **no** mark desaturates. Restore `difficulty: 0`.

---

## Task 15: Reset sweep

The exit animations were already written into `Mark.jsx` in Task 6; this task only makes sure they actually run.

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Confirm the reset path preserves element identity**

`resetGame` already returns `{ ...initialState, difficulty: prev.difficulty }`, which replaces `cells` with `initialBoard`. Because each `Cell` keys its `Mark` as `"mark"` inside an `AnimatePresence`, setting the value to `0` unmounts the mark and triggers its `exit`.

One hazard: `initialState.cells` is the *same array object* as the imported `initialBoard`, and Task 2's `insert`/AI paths copy before writing, so it is never mutated. Keep it that way — if a future edit writes into `state.cells` directly, every game after the first will start pre-filled.

- [ ] **Step 2: Verify**

Finish a game, then click the board to reset. The marks should scale away **staggered** top-left to bottom-right rather than all at once, the win line should retract the way it drew, and the result should fade up and out. Confirm the board is genuinely empty afterwards and a new game plays normally.

---

## Task 16: Manifest and remaining metadata

**Files:**
- Modify: `public/manifest.json`

- [ ] **Step 1: Replace `public/manifest.json`**

```json
{
  "short_name": "Tic Tac Toe",
  "name": "Tic Tac Toe — Minimax",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#011627",
  "background_color": "#011627"
}
```

- [ ] **Step 2: Audit `src/logo.svg`**

```bash
grep -o 'fill="[^"]*"\|stroke="[^"]*"' src/logo.svg | sort -u
```

If any colour is outside the palette (the original pieces used `#00FFFF`), replace it with `var(--nowl-cyan)`'s literal value `#7fdbca`. The logo is loaded via `<img src>`, so CSS custom properties do not reach inside it — the hex must be written into the file.

- [ ] **Step 3: Verify**

Reload and confirm the tab title, favicon and logo all render, and the logo's colours sit in the palette.

---

## Task 17: GitHub Actions deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Confirm the lockfile matches**

`npm ci` fails if `package-lock.json` disagrees with `package.json`. Task 1's `npm install` regenerated it; verify:

```bash
npm ci --dry-run
```

Expected: no error. If it complains, run `npm install` again and check the lockfile is not gitignored.

- [ ] **Step 3: Tell the repo owner what only they can do**

The workflow will run and succeed on push, but **the live site will keep serving the old `gh-pages` branch** until the Pages source is changed. Surface this explicitly when reporting the work as done:

> Settings → Pages → Source must change from "Deploy from a branch (`gh-pages`)" to "GitHub Actions". The `gh-pages` branch and the open `dependabot/npm_and_yarn/gh-pages-5.0.0` PR can be deleted afterwards.

---

## Task 18: Final verification

No step here changes code. Do all of it before reporting the work complete.

- [ ] **Step 1: Clean build**

```bash
rm -rf node_modules dist
npm install
npm run build
npm run preview
```

Expected: build succeeds, preview serves under `/javascript-minimax-tic-tac-toe/` with **zero 404s** in the Network tab. This is the check that catches a surviving `%PUBLIC_URL%`.

- [ ] **Step 2: Behaviour**

Play a full game on HARD. Confirm you cannot win — best case is a draw. Then switch to EASY and confirm you can. This is the only thing standing between a broken minimax and a shipped one, since Task 2 rewrote the code that drives it and there are no tests.

- [ ] **Step 3: All seven interactions**

Walk through them one at a time and confirm each actually runs: board draw-in on load, mark spring-up with its shadow, hover ghost, AI thinking pulse, win sequence, reset sweep, difficulty switch.

- [ ] **Step 4: Reduced motion**

In Chrome devtools: Rendering → "Emulate CSS media feature prefers-reduced-motion" → `reduce`. Reload. Animation should be suppressed and **the app must remain fully playable** — marks still appear, the game still ends, reset still works.

- [ ] **Step 5: Mobile**

Resize to 375px wide. The board should go to `90vw`. Confirm the marks and their shadows scale with it, nothing is clipped, and no ghost appears on tap.

- [ ] **Step 6: Console**

Zero errors, zero React warnings, across a full game and a reset.

---

## Out of scope — do not do these

- Writing any test suite (deliberately cut).
- Running `git commit` or asking to.
- Implementing the light half of the Night Owl palette.
- Refactoring `helper.js` beyond Task 2's copy-before-write fix.
- Re-rendering the portfolio card art at `portfolio/public/projects/tic-tac-toe.webp` — already delivered. It only needs redoing if the mark colours or shadow treatment change from what this plan specifies.
