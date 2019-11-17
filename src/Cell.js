import React from "react";

import oh from "./oh.svg";
import ex from "./ex.svg";

function Cell(props) {
  const background = props.value === 0 ? "" : props.value === 2 ? oh : ex;

  return (
    <div
      className={`cell ${props.winningPeice ? props.winningAlignment : ""}`}
      onClick={() => props.insert(props.index, true)}
    >
      <span
        style={{ backgroundImage: `url(${background})` }}
        className={`${props.value === 2 ? "oh" : "ex"}`}
      ></span>
    </div>
  );
}

export default Cell;
