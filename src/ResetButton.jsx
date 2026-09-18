import React from "react";
import { motion } from "motion/react";

import { MARK_SPRING } from "./motion";

export default function ResetButton({ onReset }) {
  return (
    <motion.button
      layout
      type="button"
      className="reset-button"
      onClick={onReset}
      whileTap={{ scale: 0.96 }}
      transition={MARK_SPRING}
    >
      reset ↺
    </motion.button>
  );
}
