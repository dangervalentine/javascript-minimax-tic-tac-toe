import React from "react";
import { AnimatePresence, motion } from "motion/react";

import { RESULT_SPRING } from "./motion";

// winner: 1 = X, 2 = O, "draw" = full board.
// Against the CPU the wording is personal ("You win"); in two-player mode
// neither side is "you", so it names the mark instead.
function describe(winner, mode, humanPlayer) {
  if (winner === "draw") return { text: "Draw", tone: "muted" };
  if (winner !== 1 && winner !== 2) return null;

  const tone = winner === 1 ? "x" : "o";
  if (mode === "human") {
    return { text: `${winner === 1 ? "X" : "O"} wins`, tone };
  }
  return { text: winner === humanPlayer ? "You win" : "Computer wins", tone };
}

export default function Result({ winner, isPlaying, mode, humanPlayer }) {
  const outcome = isPlaying ? null : describe(winner, mode, humanPlayer);

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
