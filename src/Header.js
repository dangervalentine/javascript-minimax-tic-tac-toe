import React from "react";

import logo from "./logo.svg";

function Header(props) {
  return (
    <header>
      <div className="app-info">
        <img className="logo" src={logo} alt="Minimax Tic Tac Toe logo"></img>
        <div className="header-text">
          <p className="title">Tic Tac Toe</p>
          <a
            target="_blank"
            className="credit"
            rel="noopener noreferrer"
            href="https://github.com/victoriousj"
          >
            <p>by victor d. johnson</p>
          </a>
        </div>
      </div>
      <div>
        <button onClick={() => props.resetGame()} className="reset-button">
          reset ↺
        </button>
      </div>
    </header>
  );
}

export default Header;
