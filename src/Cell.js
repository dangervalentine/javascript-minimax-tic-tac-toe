import React from "react";

const Cell = props => {
  const character = props.value === 0 ? "" : props.value === 1 ? "○" : "×";
  return (
    <div
      className={`cell ${props.value === 1 ? "oh" : "ex"}`}
      onClick={() => props.cellSelect(props.index)}
    >
      {character}
    </div>
  );
};

export default Cell;
