import React from "react";
import Cell from "./Cell";

import "./App.css";

function App() {
  const [cells, setCells] = React.useState([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const cellSelect = i => {
    const newCells = [...cells];
    newCells[i] = newCells[i] === 0 ? 1 : newCells[i] === 1 ? 2 : 0;
    setCells(newCells);
  };

  const cellEls = cells.map((cell, i) => (
    <Cell key={i} index={i} value={cell} cellSelect={cellSelect} />
  ));

  return (
    <div className="App">
      <header className="App-header"></header>
      <div className="board">{cellEls}</div>
    </div>
  );
}

export default App;
