import React from "react";
import { motion } from "motion/react";

import { MARK_SPRING, SHADOW_SPRING, RESET_STAGGER, RESET_EXIT } from "./motion";

// Geometry only. Colour comes from `currentColor`, set by the .x / .o class
// on the mark, or by .mark-shadow on the shadow copy.
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
  const exit = {
    scale: 0,
    transition: { ...RESET_EXIT, delay: index * RESET_STAGGER }
  };

  return (
    <>
      {/* The shadow is a second copy of the same glyph, so it matches the
          piece's shape rather than approximating it with an ellipse. It stays
          a separate element on its own spring — that independence is what
          reads as depth when the piece springs up. */}
      <motion.span
        className="mark-shadow"
        initial={{ scale: 0.4, opacity: 0, y: "3%" }}
        animate={{
          scale: isWinner ? 1.16 : 1,
          opacity: isLoser ? 0.25 : isWinner ? 0.75 : 0.6,
          y: isWinner ? "16%" : "11%"
        }}
        exit={{ ...exit, opacity: 0 }}
        transition={SHADOW_SPRING}
      >
        <Glyph player={player} />
      </motion.span>
      <motion.span
        className={`mark ${player === 1 ? "x" : "o"}`}
        initial={{ scale: 0 }}
        animate={{
          scale: isWinner ? 1.08 : 1,
          y: isWinner ? "-6%" : "0%",
          opacity: isLoser ? 0.35 : 1,
          filter: isLoser ? "grayscale(0.8)" : "grayscale(0)"
        }}
        exit={exit}
        transition={MARK_SPRING}
      >
        <Glyph player={player} />
      </motion.span>
    </>
  );
}
