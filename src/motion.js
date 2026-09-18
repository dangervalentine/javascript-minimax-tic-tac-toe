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
