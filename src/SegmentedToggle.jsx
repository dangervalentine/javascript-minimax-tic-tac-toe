import React from "react";
import { motion } from "motion/react";

import { MARK_SPRING } from "./motion";

// One segmented control. The sliding thumb is a `layoutId` element, which is
// what makes it travel between segments instead of blinking out and back in.
// Each instance needs its own layoutId or the thumbs animate into each other.
export default function SegmentedToggle({
  options,
  value,
  onChange,
  layoutId,
  ariaLabel
}) {
  return (
    <div className="segmented" role="group" aria-label={ariaLabel}>
      {options.map(option => {
        const on = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            className={`segment ${on ? "on" : ""}`}
            aria-pressed={on}
            onClick={() => onChange(option.value)}
          >
            {on && (
              <motion.span
                layoutId={layoutId}
                className="segment-thumb"
                transition={MARK_SPRING}
              />
            )}
            <span className={`segment-label ${option.tone || ""}`}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
