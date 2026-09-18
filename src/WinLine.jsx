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
