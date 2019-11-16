import React from "react";

function Cell(props) {
  const character = props.value === 0 ? "" : props.value === 1 ? "○" : "×";
  return (
    <div className="cell" onClick={() => props.cellSelect(props.index)}>
      <span className={`${props.value === 1 ? "oh" : "ex"}`}>{character}</span>
    </div>
  );
}

export default Cell;
