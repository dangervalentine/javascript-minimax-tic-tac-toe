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
