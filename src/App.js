import React from "react";

import Header from "./Header";
import Cell from "./Cell";

import "./App.css";

function App() {
  const initialBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const [cells, setCells] = React.useState([...initialBoard]);
  const [turn, setTurn] = React.useState(1);

  function cellSelect(i) {
    const newCells = [...cells];

    if (newCells[i] !== 0) return;

    newCells[i] = turn + 1;
    setCells(newCells);
    setTurn((turn + 1) % 2);
  }

  function resetGame() {
    setCells([...initialBoard]);
    setTurn(1);
  }

  const cellEls = cells.map((cell, i) => (
    <Cell key={i} index={i} value={cell} cellSelect={cellSelect} />
  ));

  return (
    <div className="App">
      <Header resetGame={resetGame} />
      <div className="board">{cellEls}</div>
    </div>
  );
}

export default App;
