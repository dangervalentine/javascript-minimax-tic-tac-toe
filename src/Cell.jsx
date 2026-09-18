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
  ghostPlayer,
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
          className={`mark ${ghostPlayer === 1 ? "x" : "o"} ghost`}
          variants={GHOST_VARIANTS}
          transition={GHOST}
        >
          <Glyph player={ghostPlayer} />
        </motion.span>
      )}
    </motion.div>
  );
}
