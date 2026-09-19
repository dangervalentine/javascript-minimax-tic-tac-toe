import React from "react";
import { motion } from "motion/react";

import Cell from "./Cell";
import GridLines from "./GridLines";
import WinLine from "./WinLine";
import Result from "./Result";
import { INTRO } from "./motion";

export default function Board({
  cells,
  isPlaying,
  interactive,
  thinking,
  currentPlayer,
  mode,
  humanPlayer,
  winner,
  winningPieces,
  onInsert,
  onReset
}) {
  // A draw has no winning pieces, so nobody desaturates — correct, because in
  // a draw nobody lost.
  const hasWinner = !isPlaying && winningPieces.length === 3;

  return (
    <div className="board-wrap">
      <motion.div
        className={`board ${interactive ? "active" : ""}`}
        onClick={() => !isPlaying && onReset()}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: thinking ? 0.92 : 1, scale: 1 }}
        transition={INTRO}
      >
        <GridLines />
        {cells.map((value, i) => (
          <Cell
            key={i}
            index={i}
            value={value}
            interactive={interactive}
            ghostPlayer={currentPlayer}
            isWinner={winningPieces.indexOf(i) >= 0}
            isLoser={hasWinner && winningPieces.indexOf(i) < 0 && value !== 0}
            onInsert={onInsert}
          />
        ))}
        <WinLine pieces={winningPieces} />
        {/* Rendered inside the board so the message always lands on top of it.
            Anywhere below the board is territory the fixed attribution badge
            can cover once the viewport is short enough. */}
        <Result
          winner={winner}
          isPlaying={isPlaying}
          mode={mode}
          humanPlayer={humanPlayer}
        />
      </motion.div>
    </div>
  );
}
