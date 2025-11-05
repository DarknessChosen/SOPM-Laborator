import { useEffect, useState } from 'react';
import './App.css';

function Square({ value, onSquareClick, isWinning, disabled }) {
  return (
    <button
      className={`square ${value ? 'filled' : ''} ${isWinning ? 'winner' : ''}`}
      onClick={onSquareClick}
      disabled={disabled}
      aria-label={value ? `Cell with ${value}` : 'Empty cell'}
    >
      <span className="symbol">{value}</span>
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, winnerInfo, roles, roundOver }) {
  function handleClick(i) {
    if (winnerInfo || squares[i] || roundOver) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  const isDraw = !winnerInfo && squares.every(Boolean);

  let status;
  if (winnerInfo) {
    status = `Winner: ${roles[winnerInfo.player]} (${winnerInfo.player})`;
  } else if (isDraw) {
    status = 'Draw!';
  } else {
    const nextSymbol = xIsNext ? 'X' : 'O';
    status = `Next: ${roles[nextSymbol]} (${nextSymbol})`;
  }

  const wl = winnerInfo?.line ?? [];

  return (
    <>
      <div className="status">{status}</div>

      <div className="board">
        <div className="board-row">
          <Square
            value={squares[0]}
            onSquareClick={() => handleClick(0)}
            isWinning={wl.includes(0)}
            disabled={!!winnerInfo || isDraw || roundOver}
          />
          <Square
            value={squares[1]}
            onSquareClick={() => handleClick(1)}
            isWinning={wl.includes(1)}
            disabled={!!winnerInfo || isDraw || roundOver}
          />
          <Square
            value={squares[2]}
            onSquareClick={() => handleClick(2)}
            isWinning={wl.includes(2)}
            disabled={!!winnerInfo || isDraw || roundOver}
          />
        </div>
        <div className="board-row">
          <Square
            value={squares[3]}
            onSquareClick={() => handleClick(3)}
            isWinning={wl.includes(3)}
            disabled={!!winnerInfo || isDraw || roundOver}
          />
          <Square
            value={squares[4]}
            onSquareClick={() => handleClick(4)}
            isWinning={wl.includes(4)}
            disabled={!!winnerInfo || isDraw || roundOver}
          />
          <Square
            value={squares[5]}
            onSquareClick={() => handleClick(5)}
            isWinning={wl.includes(5)}
            disabled={!!winnerInfo || isDraw || roundOver}
          />
        </div>
        <div className="board-row">
          <Square
            value={squares[6]}
            onSquareClick={() => handleClick(6)}
            isWinning={wl.includes(6)}
            disabled={!!winnerInfo || isDraw || roundOver}
          />
          <Square
            value={squares[7]}
            onSquareClick={() => handleClick(7)}
            isWinning={wl.includes(7)}
            disabled={!!winnerInfo || isDraw || roundOver}
          />
          <Square
            value={squares[8]}
            onSquareClick={() => handleClick(8)}
            isWinning={wl.includes(8)}
            disabled={!!winnerInfo || isDraw || roundOver}
          />
        </div>
      </div>
    </>
  );
}

export default function Game() {
  // istoric + mutare curentă (păstrăm structura inițială)
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);

  // nume jucători + roluri X/O
  const [p1, setP1] = useState('Player 1');
  const [p2, setP2] = useState('Player 2');
  const [roles, setRoles] = useState({ X: 'Player 1', O: 'Player 2' });

  // cine începe runda (alternăm între runde)
  const [startingSymbol, setStartingSymbol] = useState('X');

  // scor + stare rundă
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [roundOver, setRoundOver] = useState(false);
  const [hasScored, setHasScored] = useState(false);
  const [flipNote, setFlipNote] = useState('');

  // derivări
  const currentSquares = history[currentMove];
  const xIsNext =
    currentMove % 2 === 0 ? startingSymbol === 'X' : startingSymbol !== 'X';
  const winnerInfo = calculateWinner(currentSquares);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  // marcare scor la final de rundă (o singură dată)
  useEffect(() => {
    const result = calculateWinner(currentSquares);
    const draw = !result && currentSquares.every(Boolean);

    if (!hasScored && (result || draw)) {
      if (result) {
        setScores((s) => ({ ...s, [result.player]: s[result.player] + 1 }));
      } else {
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      }
      setRoundOver(true);
      setHasScored(true);
    }
  }, [currentSquares, hasScored]);

  function newRound() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setRoundOver(false);
    setHasScored(false);
    // alternează cine începe
    setStartingSymbol((prev) => (prev === 'X' ? 'O' : 'X'));
  }

  function resetScores() {
    setScores({ X: 0, O: 0, draws: 0 });
  }

  function coinFlip() {
    const heads = Math.random() < 0.5;
    const xName = heads ? (p1 || 'Player 1') : (p2 || 'Player 2');
    const oName = heads ? (p2 || 'Player 2') : (p1 || 'Player 1');
    setRoles({ X: xName, O: oName });
    setStartingSymbol('X'); // X începe după flip
    setFlipNote(`Coinflip: ${xName} este X, ${oName} este O.`);
    // reset de rundă (tablă curată)
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setRoundOver(false);
    setHasScored(false);
  }

  // (opțional) schimbă manual X/O
  function swapRoles() {
    setRoles(({ X, O }) => ({ X: O, O: X }));
    setStartingSymbol('X');
    setFlipNote(`Swapped: ${roles.O} este acum X.`);
    newRound();
  }

  return (
    <div className="game">
      <header className="hud">
        <div className="players">
          <div className="player">
            <label>Player 1</label>
            <input
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              placeholder="Nickname Player 1"
            />
          </div>
          <div className="player">
            <label>Player 2</label>
            <input
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              placeholder="Nickname Player 2"
            />
          </div>

          <div className="roles-row">
            <button className="btn coin" onClick={coinFlip} title="Decide X/O">
              Coinflip for X & 0
            </button>
            <button className="btn ghost" onClick={swapRoles} title="Swap X/O">
              Swap X ↔ O
            </button>
          </div>

          <div className="roles">
            <span className="badge x">X</span> {roles.X} &nbsp;|&nbsp;
            <span className="badge o">O</span> {roles.O}
          </div>

          {flipNote && <div className="note">{flipNote}</div>}
        </div>

        <div className="scoreboard">
          <h2>Score</h2>
          <div className="line">
            <span className="badge x">X</span>
            <span className="name">{roles.X}</span>
            <span className="value">{scores.X}</span>
          </div>
          <div className="line">
            <span className="badge o">O</span>
            <span className="name">{roles.O}</span>
            <span className="value">{scores.O}</span>
          </div>
          <div className="line dim">
            <span className="badge d">=</span>
            <span className="name">Draws</span>
            <span className="value">{scores.draws}</span>
          </div>

          <div className="actions">
            <button className="btn" onClick={newRound}>
              New round
            </button>
            <button className="btn danger" onClick={resetScores}>
              Reset score
            </button>
          </div>
        </div>
      </header>

      <div className="game-board card">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          winnerInfo={winnerInfo}
          roles={roles}
          roundOver={roundOver}
        />
      </div>
    </div>
  );
}

/**
 * Modificat: întoarce atât jucătorul câștigător (X/O), cât și linia câștigătoare.
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
}
