import React from "react";
import { AnimatePresence, motion } from "motion/react";

import logo from "./logo.svg";
import ResetButton from "./ResetButton";
import SegmentedToggle from "./SegmentedToggle";
import { INTRO, THINKING_PULSE } from "./motion";

const MODE_OPTIONS = [
  { value: "cpu", label: "VS CPU" },
  { value: "human", label: "2 PLAYER" }
];

const SIDE_OPTIONS = [
  { value: 1, label: "X", tone: "x" },
  { value: 2, label: "O", tone: "o" }
];

// helper.js: max_depth = difficulty ? 2 : 6. Deeper search = harder opponent,
// so 0 is HARD and 1 is EASY. Not a typo.
const DIFFICULTY_OPTIONS = [
  { value: 0, label: "HARD" },
  { value: 1, label: "EASY" }
];

export default function Header({
  mode,
  humanPlayer,
  difficulty,
  thinking,
  currentPlayer,
  isPlaying,
  onModeChange,
  onSideChange,
  onDifficultyChange,
  onReset
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
          className={`turn-dot ${currentPlayer === 1 ? "x" : "o"} ${
            thinking ? "thinking" : ""
          }`}
          aria-hidden="true"
          animate={
            thinking
              ? { opacity: [1, 0.35, 1], scale: [1, 0.85, 1] }
              : { opacity: isPlaying ? 1 : 0, scale: 1 }
          }
          transition={thinking ? THINKING_PULSE : { duration: 0.2 }}
        />
      </div>

      <div className="header-buttons">
        <SegmentedToggle
          layoutId="mode-thumb"
          ariaLabel="Opponent"
          options={MODE_OPTIONS}
          value={mode}
          onChange={onModeChange}
        />

        <AnimatePresence initial={false}>
          {mode === "cpu" && (
            <motion.div
              key="cpu-options"
              className="header-buttons"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SegmentedToggle
                layoutId="side-thumb"
                ariaLabel="Play as"
                options={SIDE_OPTIONS}
                value={humanPlayer}
                onChange={onSideChange}
              />
              <SegmentedToggle
                layoutId="difficulty-thumb"
                ariaLabel="Difficulty"
                options={DIFFICULTY_OPTIONS}
                value={difficulty}
                onChange={onDifficultyChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ResetButton onReset={onReset} />
      </div>
    </motion.header>
  );
}
