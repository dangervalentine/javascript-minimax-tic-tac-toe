export const initialBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];

function isEmpty(board) {
  return board.every(x => !x);
}

function isFull(board) {
  return board.every(x => x);
}

export function getAvailableMoves(board) {
  const moves = [];
  board.forEach((x, i) => {
    if (!x) moves.push(i);
  });
  return moves;
}

export function isTerminal(board) {
  if (isEmpty(board)) return false;

  if (board[0] === board[1] && board[0] === board[2] && board[0]) {
    return { winner: board[0], direction: "H", row: 1, pieces: [0, 1, 2] };
  }
  if (board[3] === board[4] && board[3] === board[5] && board[3]) {
    return { winner: board[3], direction: "H", row: 2, pieces: [3, 4, 5] };
  }
  if (board[6] === board[7] && board[6] === board[8] && board[6]) {
    return { winner: board[6], direction: "H", row: 3, pieces: [6, 7, 8] };
  }
  //Checking Vertical Wins
  if (board[0] === board[3] && board[0] === board[6] && board[0]) {
    return { winner: board[0], direction: "V", row: 1, pieces: [0, 3, 6] };
  }
  if (board[1] === board[4] && board[1] === board[7] && board[1]) {
    return { winner: board[1], direction: "V", row: 2, pieces: [1, 4, 7] };
  }
  if (board[2] === board[5] && board[2] === board[8] && board[2]) {
    return { winner: board[2], direction: "V", row: 3, pieces: [2, 5, 8] };
  }
  //Checking Diagonal Wins
  if (board[0] === board[4] && board[0] === board[8] && board[0]) {
    return { winner: board[0], direction: "DL", row: 1, pieces: [0, 4, 8] };
  }
  if (board[2] === board[4] && board[2] === board[6] && board[2]) {
    return { winner: board[2], direction: "DR", row: 2, pieces: [2, 4, 6] };
  }
  //If no winner but the board is full, then it's a draw
  if (isFull(board)) return { winner: "draw", pieces: [] };

  //return false otherwise
  return false;
}

let nodes_map = new Map();
let max_depth = 6;

export function getBestMove(
  board,
  maximizing = true,
  callback = () => {},
  depth = 0
) {
  if (depth === 0) nodes_map.clear();
  if (isTerminal(board) || depth === max_depth) {
    if (isTerminal(board).winner === 1) {
      return 100 - depth;
    } else if (isTerminal(board).winner === 2) {
      return -100 + depth;
    }
    return 0;
  }
  //Current player is maximizing
  if (maximizing) {
    //Initializ best to the lowest possible value
    let best = -100;
    //Loop through all empty cells
    getAvailableMoves(board).forEach(index => {
      //Initialize a new board with the current state (slice() is used to create a new array and not modify the original)
      let child = [...board];
      //Create a child node by inserting the maximizing symbol x into the current empty cell
      child[index] = 1;
      //Recursively calling getBestMove this time with the new board and minimizing turn and incrementing the depth
      let node_value = getBestMove(child, false, callback, depth + 1);
      //Updating best value
      best = Math.max(best, node_value);

      //If it's the main function call, not a recursive one, map each heuristic value with it's moves indicies
      if (depth === 0) {
        //Comma seperated indicies if multiple moves have the same heuristic value
        var moves = nodes_map.has(node_value)
          ? `${nodes_map.get(node_value)},${index}`
          : index;
        nodes_map.set(node_value, moves);
      }
    });
    //If it's the main call, return the index of the best move or a random index if multiple indicies have the same value
    if (depth === 0) {
      if (typeof nodes_map.get(best) === "string") {
        var arr = nodes_map.get(best).split(",");
        var rand = Math.floor(Math.random() * arr.length);
        var ret = arr[rand];
      } else {
        ret = nodes_map.get(best);
      }
      //run a callback after calculation and return the index
      callback(ret);
      return ret;
    }
    //If not main call (recursive) return the heuristic value for next calculation
    return best;
  }
  if (!maximizing) {
    //Initializ best to the highest possible value
    let best = 100;
    //Loop through all empty cells
    getAvailableMoves(board).forEach(index => {
      //Initialize a new board with the current state (slice() is used to create a new array and not modify the original)
      let child = [...board];
      //Create a child node by inserting the minimizing symbol o into the current emoty cell
      child[index] = 2;

      //Recursively calling getBestMove this time with the new board and maximizing turn and incrementing the depth
      let node_value = getBestMove(child, true, callback, depth + 1);
      //Updating best value
      best = Math.min(best, node_value);

      //If it's the main function call, not a recursive one, map each heuristic value with it's moves indicies
      if (depth === 0) {
        //Comma seperated indicies if multiple moves have the same heuristic value
        var moves = nodes_map.has(node_value)
          ? nodes_map.get(node_value) + "," + index
          : index;
        nodes_map.set(node_value, moves);
      }
    });
    //If it's the main call, return the index of the best move or a random index if multiple indicies have the same value
    if (depth === 0) {
      if (typeof nodes_map.get(best) === "string") {
        var arr = nodes_map.get(best).split(",");
        var rand = Math.floor(Math.random() * arr.length);
        var ret = arr[rand];
      } else {
        ret = nodes_map.get(best);
      }
      //run a callback after calculation and return the index
      callback(ret);
      return ret;
    }
    //If not main call (recursive) return the heuristic value for next calculation
    return best;
  }
}
