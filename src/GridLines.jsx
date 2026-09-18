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
