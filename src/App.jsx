import React from "react";

import Header from "./Header";
import Board from "./Board";

import { initialBoard, boardHelper } from "./helper";
import { AI_MOVE_DELAY } from "./motion";
import "./App.css";

// Cell values: 0 = empty, 1 = X, 2 = O. X always moves first, so the player to
// move is always `turn + 1` regardless of who is controlling that side.
const initialState = {
  winningAlignment: "",
  winningPieces: [],
  cells: initialBoard,
  isPlaying: true,
  difficulty: 0,
  mode: "cpu", // "cpu" | "human"
  humanPlayer: 1, // which side the human takes in "cpu" mode
  winner: "",
  turn: 0
};

function App() {
  const [state, setState] = React.useState({ ...initialState });

  const currentPlayer = state.turn + 1;
  // In "cpu" mode the AI takes whichever side the human did not. In "human"
  // mode there is no AI at all.
  const aiPlayer = state.mode === "cpu" ? (state.humanPlayer === 1 ? 2 : 1) : 0;
  const isHumanTurn = state.mode === "human" || currentPlayer !== aiPlayer;

  // Applies a finished board to state and, if that board ended the game,
  // records the outcome in the same update.
  const commit = React.useCallback(cells => {
    const outcome = new boardHelper().isTerminal(cells);
    setState(prev => ({
      ...prev,
      cells,
      turn: (prev.turn + 1) % 2,
      ...(outcome
        ? {
            // A draw returns no `direction` key, so default it.
            winningAlignment: outcome.direction || "",
            winningPieces: outcome.pieces,
            winner: outcome.winner,
            isPlaying: false
          }
        : {})
    }));
  }, []);

  function insert(i) {
    if (!state.isPlaying || !isHumanTurn || state.cells[i] !== 0) return;
    const cells = [...state.cells];
    cells[i] = currentPlayer;
    commit(cells);
  }

  React.useEffect(() => {
    if (!state.isPlaying || state.mode !== "cpu") return;
    if (state.turn + 1 !== aiPlayer) return;

    const timer = window.setTimeout(() => {
      const helper = new boardHelper(state.difficulty);
      // helper.js scores X (1) as the maximizing side, so the AI maximizes
      // only when it is playing X.
      const move = Number(helper.getBestMove(state.cells, aiPlayer === 1));
      if (state.cells[move] !== 0) return;
      const cells = [...state.cells];
      cells[move] = aiPlayer;
      commit(cells);
    }, AI_MOVE_DELAY);

    return () => window.clearTimeout(timer);
  }, [
    state.turn,
    state.isPlaying,
    state.cells,
    state.difficulty,
    state.mode,
    aiPlayer,
    commit
  ]);

  // Reset keeps the match settings; only the board is cleared.
  function resetGame() {
    setState(prev => ({
      ...initialState,
      difficulty: prev.difficulty,
      mode: prev.mode,
      humanPlayer: prev.humanPlayer
    }));
  }

  // Changing a match setting starts a fresh game rather than leaving a
  // half-played board owned by the wrong players.
  function changeSetting(patch) {
    setState(prev => ({
      ...initialState,
      difficulty: prev.difficulty,
      mode: prev.mode,
      humanPlayer: prev.humanPlayer,
      ...patch
    }));
  }

  return (
    <div className="app">
      <Header
        mode={state.mode}
        humanPlayer={state.humanPlayer}
        difficulty={state.difficulty}
        thinking={state.isPlaying && state.mode === "cpu" && !isHumanTurn}
        currentPlayer={currentPlayer}
        isPlaying={state.isPlaying}
        onModeChange={mode => changeSetting({ mode })}
        onSideChange={humanPlayer => changeSetting({ humanPlayer })}
        onDifficultyChange={difficulty => changeSetting({ difficulty })}
        onReset={resetGame}
      />
      <Board
        cells={state.cells}
        isPlaying={state.isPlaying}
        interactive={state.isPlaying && isHumanTurn}
        thinking={state.isPlaying && !isHumanTurn}
        currentPlayer={currentPlayer}
        mode={state.mode}
        humanPlayer={state.humanPlayer}
        winner={state.winner}
        winningPieces={state.winningPieces}
        onInsert={insert}
        onReset={resetGame}
      />
    </div>
  );
}

export default App;
