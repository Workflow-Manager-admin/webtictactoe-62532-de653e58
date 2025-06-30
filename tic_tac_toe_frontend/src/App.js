import React, { useState, useEffect } from 'react';
import './App.css';

// Color config for styles
const COLORS = {
  primary: '#1976d2',   // blue
  secondary: '#424242', // dark gray
  accent: '#ffb300'     // yellow/orange
};

// PUBLIC_INTERFACE
function App() {
  // Game board state: array of 9 elements, 'X' | 'O' | null
  const [board, setBoard] = useState(Array(9).fill(null));
  // 'X' goes first by default
  const [xIsNext, setXIsNext] = useState(true);
  // 'human-human' or 'human-ai'
  const [gameMode, setGameMode] = useState('human-ai');
  // true if winner found or draw
  const [gameOver, setGameOver] = useState(false);
  // Winner: 'X', 'O', or null
  const [winner, setWinner] = useState(null);
  // Lock user input while AI moves
  const [boardLocked, setBoardLocked] = useState(false);

  // Effect: check for winner or draw after any board update
  useEffect(() => {
    const win = calculateWinner(board);
    if (win) {
      setGameOver(true);
      setWinner(win);
      setBoardLocked(false);
    } else if (board.every(Boolean)) {
      setGameOver(true);
      setWinner(null);
      setBoardLocked(false);
    } else {
      setGameOver(false);
      setWinner(null);
      // If single player AI, and it's AI's turn, trigger AI move
      if (
        gameMode === 'human-ai' &&
        !xIsNext // AI is 'O'
      ) {
        setBoardLocked(true);
        setTimeout(() => {
          makeAIMove();
        }, 350); // Short delay for natural feel
      } else {
        setBoardLocked(false);
      }
    }
    // eslint-disable-next-line
  }, [board, gameMode]);

  // PUBLIC_INTERFACE
  const handleCellClick = idx => {
    if (boardLocked || gameOver || board[idx]) return;
    // No moves if AI's turn (in single player)
    if (gameMode === 'human-ai' && !xIsNext) return;
    const next = board.slice();
    next[idx] = xIsNext ? 'X' : 'O';
    setBoard(next);
    setXIsNext(!xIsNext);
  };

  // PUBLIC_INTERFACE
  // Simple AI: choose first empty, win if possible, block if needed
  const makeAIMove = () => {
    const aiLetter = 'O', humanLetter = 'X';
    // Try to win
    let move = findBestMove(board, aiLetter);
    // Block human
    if (move == null) move = findBestMove(board, humanLetter);
    // Otherwise pick first available
    if (move == null) move = board.findIndex(x => x === null);

    if (move != null && board[move] == null) {
      const next = [...board];
      next[move] = aiLetter;
      setBoard(next);
      setXIsNext(true); // human's turn
    }
    setBoardLocked(false);
  };

  // PUBLIC_INTERFACE
  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setGameOver(false);
    setBoardLocked(false);
  };

  // PUBLIC_INTERFACE
  // Mode switch: "human-ai" or "human-human"
  const handleModeChange = mode => {
    setGameMode(mode);
    restartGame();
  };

  // Get game status string
  let status;
  if (winner === 'X') status = gameMode === 'human-ai' ? "You Win! 🎉" : "Player X Wins! 🎉";
  else if (winner === 'O') status = gameMode === 'human-ai' ? "AI Wins! 🤖" : "Player O Wins! 🎉";
  else if (gameOver && !winner) status = "It's a Draw! 🤝";
  else status =
    gameMode === 'human-ai'
      ? xIsNext
        ? "Your turn"
        : "AI's turn"
      : `Turn: ${xIsNext ? "X" : "O"}`;

  // Render

  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        background: "#fff",
        color: COLORS.secondary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start"
      }}
    >
      <main className="ttt-main" style={{ width: "100%", paddingTop: 52, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Header */}
        <header className="ttt-header" style={{
          width: "100%",
          maxWidth: 440,
          marginBottom: 32,
          textAlign: "center"
        }}>
          <h1 style={{
            color: COLORS.primary,
            letterSpacing: "1.5px",
            marginBottom: 8,
            fontWeight: 700,
            fontSize: 32,
            fontFamily: "'Segoe UI', 'Roboto', sans-serif"
          }}>
            Tic Tac Toe
          </h1>
          <div style={{
            margin: "0 auto 20px",
            display: "flex",
            gap: 10,
            justifyContent: "center"
          }}>
            <ModeButton
              mode="human-ai"
              selected={gameMode === 'human-ai'}
              onClick={handleModeChange}
              label="1P: vs AI"
              color={COLORS.primary}
            />
            <ModeButton
              mode="human-human"
              selected={gameMode === 'human-human'}
              onClick={handleModeChange}
              label="2P: Local"
              color={COLORS.secondary}
            />
          </div>
        </header>

        {/* Game Board */}
        <section
          className="ttt-board-section"
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <Board
            board={board}
            onCellClick={handleCellClick}
            gameOver={gameOver}
            winner={winner}
            color={COLORS.primary}
            accent={COLORS.accent}
          />
        </section>

        {/* Controls and Status */}
        <section className="ttt-controls-status" style={{
          marginTop: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          minHeight: 110
        }}>
          <div
            className="ttt-status"
            style={{
              fontSize: 20,
              color: COLORS.secondary,
              minHeight: 28,
              fontWeight: 500,
              marginBottom: 2,
              fontFamily: "'Segoe UI', 'Roboto', sans-serif"
            }}>
            {status}
          </div>
          <button
            className="ttt-btn"
            style={{
              background: COLORS.accent,
              color: "#fff",
              border: "none",
              borderRadius: 9,
              padding: "11px 38px",
              fontWeight: 600,
              fontSize: 18,
              marginTop: 4,
              cursor: "pointer",
              letterSpacing: ".08em",
              boxShadow: "0 2px 8px 0 rgba(25,118,210,0.08)"
            }}
            onClick={restartGame}
            aria-label="Restart Game"
            tabIndex={0}
          >
            ⭯ Restart
          </button>
        </section>
      </main>
      <footer style={{ marginTop: "auto", marginBottom: 24, color: COLORS.secondary, fontSize: 12, opacity: 0.45 }}>
        Made with React • v1.0
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
// Board Component
function Board({ board, onCellClick, gameOver, winner, color, accent }) {
  // Render 3x3 grid
  return (
    <div
      className="ttt-board"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 74px)",
        gridTemplateRows: "repeat(3, 74px)",
        gap: 0,
        background: "#f8f9fa",
        borderRadius: 16,
        boxShadow: "0 4px 12px 0 rgba(31,41,51,.07)",
        border: `2px solid ${color}`,
        overflow: "hidden",
        marginBottom: 2
      }}
    >
      {board.map((cell, idx) => (
        <Cell
          key={idx}
          value={cell}
          onClick={() => onCellClick(idx)}
          disabled={!!cell || gameOver}
          accent={accent}
          idx={idx}
          winner={winner}
        />
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
// Cell (single square) component
function Cell({ value, onClick, disabled, accent, idx, winner }) {
  let color = "#424242";
  if (value === 'X') color = "#1976d2";
  if (value === 'O') color = "#ffb300";

  return (
    <button
      className="ttt-cell"
      onClick={onClick}
      disabled={disabled}
      aria-label={`cell ${idx + 1}${value ? ` ${value}` : ''}`}
      style={{
        width: 74,
        height: 74,
        fontSize: "2rem",
        fontWeight: 700,
        background: "#fff",
        color,
        border: "none",
        borderRight: (idx % 3 !== 2) ? "2px solid #e0e0e0" : "none",
        borderBottom: (Math.floor(idx / 3) !== 2) ? "2px solid #e0e0e0" : "none",
        transition: "background 0.15s",
        cursor: disabled ? "default" : "pointer",
        outline: "none"
      }}
      tabIndex={0}
    >
      {value}
    </button>
  );
}

// PUBLIC_INTERFACE
// Mode selection button
function ModeButton({ mode, selected, onClick, label, color }) {
  return (
    <button
      onClick={() => onClick(mode)}
      aria-pressed={selected}
      aria-label={label}
      style={{
        background: selected ? color : "#f5f5f5",
        color: selected ? "#fff" : color,
        border: `2px solid ${color}`,
        borderRadius: 7,
        padding: "8px 23px",
        fontWeight: 600,
        letterSpacing: ".04em",
        fontSize: 16,
        marginBottom: 0,
        opacity: selected ? 1 : 0.93,
        boxShadow: selected ? "0 2px 9px 0 rgba(25,118,210,0.18)" : "none",
        transition: "all 0.13s"
      }}
      tabIndex={0}
    >
      {label}
    </button>
  );
}

// --- GAME UTILITY FUNCTIONS ---

// PUBLIC_INTERFACE
function calculateWinner(board) {
  // returns 'X' or 'O' or null
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6] // diagonals
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function findBestMove(board, player) {
  // Checks if player can win on next move.
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6] // diagonals
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    const cells = [board[a], board[b], board[c]];
    // If two of the same and one empty, return the empty idx
    if (
      cells.filter(val => val === player).length === 2 &&
      cells.filter(val => val == null).length === 1
    ) {
      const emptyIdx = line[cells.findIndex(val => val == null)];
      if (board[emptyIdx] == null) return emptyIdx;
    }
  }
  return null;
}

export default App;
