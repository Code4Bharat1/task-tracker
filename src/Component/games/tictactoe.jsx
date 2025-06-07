import React, { useState, useEffect } from "react";
import {
  Users,
  RotateCcw,
  Play,
  Trophy,
  X,
  Circle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { io } from "socket.io-client";

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
  {
    autoConnect: false,
    withCredentials: true,
  }
);

const getOrCreateUserId = () => {
  if (typeof window === "undefined") return null;
  let stored = localStorage.getItem("userId");
  if (!stored) {
    stored = Math.random().toString(36).substr(2, 9);
    localStorage.setItem("userId", stored);
  }
  return stored;
};

const TicTacToeGame = () => {
  const [userId] = useState(getOrCreateUserId);
  const [gameStarted, setGameStarted] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winningLine, setWinningLine] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [debugInfo, setDebugInfo] = useState([]);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playerNames, setPlayerNames] = useState({});

  const addDebugInfo = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo((prev) => [...prev.slice(-4), `${timestamp}: ${msg}`]);
  };

  const makeMove = (index) => {
    if (board[index] || gameOver || waitingForPlayer) return;
    if (currentPlayer !== playerSymbol) {
      addDebugInfo("Not your turn!");
      return;
    }
    socket.emit("tictactoe-move", { roomId, index });
  };

  const generateRoomId = () => {
    setRoomId(Math.random().toString(36).substr(2, 8).toUpperCase());
  };

  const startGame = () => {
    if (!roomId.trim() || !playerName.trim()) {
      alert("Please enter both Room ID and Player Name");
      return;
    }
    setGameStarted(true);
    setWaitingForPlayer(true);
    setConnectionStatus("connecting");
    socket.emit("tictactoe-join", {
      roomId: roomId.trim(),
      userName: playerName.trim(),
    });
  };

  const resetGame = () => {
    socket.emit("tictactoe-reset", { roomId });
    setGameStarted(false);
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsDraw(false);
    setGameOver(false);
    setWinningLine([]);
    setWaitingForPlayer(false);
    setScores({ X: 0, O: 0, draws: 0 });
    setPlayerSymbol(null);
  };

  const newRound = () => {
    socket.emit("tictactoe-reset", { roomId });
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsDraw(false);
    setGameOver(false);
    setWinningLine([]);
    setCurrentPlayer("X");
  };

  useEffect(() => {
    socket.auth = { userId };
    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionStatus("connected");
      addDebugInfo("Connected to server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
      addDebugInfo("Disconnected from server");
    });

    socket.on("tictactoe-waiting", () => {
      setWaitingForPlayer(true);
      setConnectionStatus("waiting");
    });

    socket.on("tictactoe-joined", (data) => {
      setWaitingForPlayer(false);
      setConnectionStatus("playing");
    });

    socket.on("tictactoe-state", (data) => {
      const {
        board,
        currentPlayer,
        gameStarted,
        gameOver,
        winner,
        players,
        playerNames,
      } = data;
      setBoard(board);
      setCurrentPlayer(currentPlayer);
      setWaitingForPlayer(!gameStarted);
      setPlayers(players);
      setPlayerNames(playerNames);

      // ✅ Key fix: Set correct player symbol
      if (players[0] === userId) setPlayerSymbol("X");
      else if (players[1] === userId) setPlayerSymbol("O");

      if (winner) {
        setWinner(winner);
        setGameOver(true);
        setScores((prev) => ({ ...prev, [winner]: prev[winner] + 1 }));
      } else if (board.every((cell) => cell !== null)) {
        setIsDraw(true);
        setGameOver(true);
        setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
      } else {
        setWinner(null);
        setGameOver(false);
        setIsDraw(false);
      }
    });

    socket.on("player-disconnected", () => {
      setWaitingForPlayer(true);
      setPlayerSymbol(null);
    });

    socket.on("tictactoe-error", (error) => {
      addDebugInfo(`Error: ${error.message}`);
      alert(`Game Error: ${error.message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const Cell = ({ index, value }) => (
    <div
      onClick={() => makeMove(index)}
      className="w-24 h-24 border border-gray-300 flex items-center justify-center text-4xl font-bold cursor-pointer hover:bg-gray-100"
    >
      {value === "X" ? (
        <span className="text-red-500">X</span>
      ) : value === "O" ? (
        <span className="text-blue-500">O</span>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            TicTacToe Online
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            {isConnected ? (
              <>
                <Wifi size={16} className="text-green-500" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-red-500" />
                <span>Disconnected</span>
              </>
            )}
          </div>
        </div>

        {!gameStarted && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Join or Create Game
              </h2>

              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      placeholder="Enter room ID"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <button
                      onClick={generateRoomId}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mt-4">
                  <Users size={20} />
                  <span>Multiplayer Mode</span>
                </div>

                <button
                  onClick={startGame}
                  disabled={!roomId.trim() || !playerName.trim()}
                  className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <Play size={20} />
                  Join Game
                </button>

                <div className="text-xs text-gray-500 mt-4">
                  <p>Share the Room ID with your friend to play together!</p>
                  <p>
                    User ID:{" "}
                    <code className="bg-gray-100 px-1 rounded">{userId}</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameStarted && waitingForPlayer && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Waiting for opponent...
              </h3>
              <p className="text-gray-600">
                Share room ID:{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">{roomId}</code>
              </p>
              {playerSymbol && (
                <p className="text-gray-600 mt-2">
                  You will play as:{" "}
                  <span className="font-bold">
                    {playerSymbol === "X" ? (
                      <span className="text-red-500">X</span>
                    ) : (
                      <span className="text-blue-500">O</span>
                    )}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {gameStarted && !waitingForPlayer && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!gameOver && !isDraw && (
                  <>
                    <div className="flex items-center gap-2">
                      {currentPlayer === "X" ? (
                        <X size={24} className="text-red-500" />
                      ) : (
                        <Circle size={24} className="text-blue-500" />
                      )}
                      <span className="font-semibold text-gray-800">
                        {currentPlayer === playerSymbol
                          ? "Your turn"
                          : `${
                              playerNames[players.find((p) => p !== userId)]
                            }'s turn`}
                      </span>
                    </div>
                  </>
                )}
                {winner && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Trophy size={24} />
                    <span className="font-bold">
                      {winner === playerSymbol
                        ? "You win!"
                        : `${
                            playerNames[players.find((p) => p !== userId)]
                          } wins!`}
                    </span>
                  </div>
                )}
                {isDraw && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Trophy size={24} />
                    <span className="font-bold">It's a Draw!</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {gameOver && (
                  <button
                    onClick={newRound}
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    <Play size={16} />
                    New Round
                  </button>
                )}
                <button
                  onClick={resetGame}
                  className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </div>
            {playerSymbol && (
              <div className="mt-2 text-sm text-gray-600">
                You are playing as:{" "}
                {playerSymbol === "X" ? (
                  <span className="text-red-500 font-bold">X</span>
                ) : (
                  <span className="text-blue-500 font-bold">O</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {gameStarted && !waitingForPlayer && (
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-3 gap-0 max-w-sm mx-auto">
                  {board.map((cell, index) => (
                    <Cell key={index} index={index} value={cell} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {gameStarted && (
            <div className="lg:w-80">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy size={20} />
                  Scoreboard
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <X size={20} className="text-red-500" />
                      <span className="font-medium text-gray-800">
                        {players[0] && playerNames[players[0]]
                          ? `${playerNames[players[0]]} (X)`
                          : "Player X"}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-red-500">
                      {scores.X}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Circle size={20} className="text-blue-500" />
                      <span className="font-medium text-gray-800">
                        {players[1] && playerNames[players[1]]
                          ? `${playerNames[players[1]]} (O)`
                          : "Player O"}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-blue-500">
                      {scores.O}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-400"></div>
                      <span className="font-medium text-gray-800">Draws</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-500">
                      {scores.draws}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Debug Info
                </h3>
                <div className="space-y-1 text-xs font-mono text-gray-600 max-h-32 overflow-y-auto">
                  {debugInfo.map((info, index) => (
                    <div key={index} className="border-b border-gray-100 pb-1">
                      {info}
                    </div>
                  ))}
                  {debugInfo.length === 0 && (
                    <div className="text-gray-400">No debug info yet...</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicTacToeGame;
