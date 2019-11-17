import React from "react";

import Header from "./Header";
import Cell from "./Cell";

import { initialBoard, isTerminal, getBestMove } from "./helper";
import "./App.css";

function App() {
  const [state, setState] = React.useState({ ...initialState });

  function insert(i) {
    let newCells = [...state.cells];
    if (newCells[i] !== 0 || !state.isPlaying) return;

    newCells[i] = state.turn + 1;
    setState(prevState => ({
      ...prevState,
      cells: newCells,
      turn: (state.turn + 1) % 2
    }));

    const updateObj = isTerminal(newCells);
    if (updateObj) {
      setState(prevState => ({
        ...prevState,
        winningAlignment: updateObj.direction,
        winningPeices: updateObj.pieces,
        winner: updateObj.winner,
        isPlaying: false
      }));
    }
  }
  React.useEffect(() => {
    if (state.turn === 1) {
      window.setTimeout(() => enemyGo(state.cells), 200);
    }
  });

  function enemyGo(newCells) {
    let i = getBestMove(newCells, false);
    if (newCells[i] !== 0 || !state.isPlaying) return;

    newCells[i] = state.turn + 1;
    setState(prevState => ({
      ...prevState,
      cells: newCells,
      turn: (state.turn + 1) % 2
    }));

    const updateObj = isTerminal(newCells);
    if (updateObj) {
      setState(prevState => ({
        ...prevState,
        winningAlignment: updateObj.direction,
        winningPeices: updateObj.pieces,
        winner: updateObj.winner,
        isPlaying: false
      }));
    }
  }

  function resetGame() {
    setState({ ...initialState });
  }

  return (
    <div>
      <Header resetGame={resetGame} />
      <div className={`board ${state.isPlaying ? "active" : ""}`}>
        {state.cells.map((cell, i) => (
          <Cell
            key={i}
            index={i}
            value={cell}
            insert={insert}
            winningAlignment={state.winningAlignment}
            winningPeice={state.winningPeices.indexOf(i) >= 0}
          />
        ))}
      </div>
    </div>
  );
}

const initialState = {
  winningAlignment: "",
  winningPeices: [],
  cells: initialBoard,
  isPlaying: true,
  winner: "",
  turn: 0
};

export default App;
