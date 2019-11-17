import React from "react";

function Cell(props) {
  const character = props.value === 0 ? "" : props.value === 2 ? "○" : "×";
  return (
    <div
      className={`cell ${props.winningPeice ? props.winningAlignment : ""}`}
      onClick={() => props.insert(props.index, true)}
    >
      <span className={`${props.value === 2 ? "oh" : "ex"}`}>{character}</span>
    </div>
  );
}

export default Cell;
