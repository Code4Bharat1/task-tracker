import React, { useState, useEffect } from "react";
import {
  Users,
  RotateCcw,
  Play,
  Trophy,
  Zap,
  Hand,
  Scissors,
  Bot,
  Wifi,
  Home,
  Share2,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

const RockPaperScissorsGame = () => {
  const [playMode, setPlayMode] = useState("menu"); // 'menu', 'computer', 'local', 'online'
  const [playerCount, setPlayerCount] = useState(4);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameMode, setGameMode] = useState("tournament");
  const [players, setPlayers] = useState([]);
  const [roundChoices, setRoundChoices] = useState({});
  const [roundResults, setRoundResults] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [winner, setWinner] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [hiddenChoices, setHiddenChoices] = useState({}); // Track which choices are hidden

  // Computer mode states
  const [computerDifficulty, setComputerDifficulty] = useState("medium");
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);

  // Online mode states
  const [roomCode, setRoomCode] = useState("");
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  const playerColors = {
    2: ["bg-red-500", "bg-blue-500"],
    4: ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"],
    6: [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-orange-500",
    ],
    8: [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
    ],
  };

  const playerNames = [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Purple",
    "Orange",
    "Pink",
    "Indigo",
  ];

  const choices = [
    { name: "rock", emoji: "🪨", icon: "✊" },
    { name: "paper", emoji: "📄", icon: "✋" },
    { name: "scissors", emoji: "✂️", icon: "✌️" },
  ];

  // Generate random room code
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Computer AI logic
  const getComputerChoice = () => {
    if (computerDifficulty === "easy") {
      // Random choice
      return choices[Math.floor(Math.random() * choices.length)].name;
    } else if (computerDifficulty === "medium") {
      // Slightly strategic - occasionally counters player's last choice
      if (gameHistory.length > 0 && Math.random() > 0.4) {
        const lastPlayerChoice = gameHistory[gameHistory.length - 1].choices[0];
        if (lastPlayerChoice === "rock") return "paper";
        if (lastPlayerChoice === "paper") return "scissors";
        if (lastPlayerChoice === "scissors") return "rock";
      }
      return choices[Math.floor(Math.random() * choices.length)].name;
    } else {
      // Hard - analyzes patterns and counters
      if (gameHistory.length >= 2) {
        const recentChoices = gameHistory.slice(-3).map((h) => h.choices[0]);
        const choiceCounts = { rock: 0, paper: 0, scissors: 0 };
        recentChoices.forEach((choice) => choiceCounts[choice]++);

        const mostCommon = Object.keys(choiceCounts).reduce((a, b) =>
          choiceCounts[a] > choiceCounts[b] ? a : b
        );

        // Counter the most common choice
        if (mostCommon === "rock") return "paper";
        if (mostCommon === "paper") return "scissors";
        if (mostCommon === "scissors") return "rock";
      }
      return choices[Math.floor(Math.random() * choices.length)].name;
    }
  };

  // Initialize game based on mode
  const initializeGame = () => {
    if (playMode === "computer") {
      const newPlayers = [
        {
          id: 0,
          name: "You",
          color: "bg-blue-500",
          score: 0,
          wins: 0,
          eliminated: false,
        },
        {
          id: 1,
          name: "Computer",
          color: "bg-red-500",
          score: 0,
          wins: 0,
          eliminated: false,
          isComputer: true,
        },
      ];
      setPlayers(newPlayers);
      setPlayerScore(0);
      setComputerScore(0);
    } else {
      const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
        id: i,
        name: playerNames[i],
        color: playerColors[playerCount][i],
        score: 0,
        wins: 0,
        eliminated: false,
      }));
      setPlayers(newPlayers);
    }

    setRoundChoices({});
    setRoundResults(null);
    setGameHistory([]);
    setWinner(null);
    setShowResults(false);
    setCurrentRound(1);
    setHiddenChoices({});
  };

  const startGame = () => {
    initializeGame();
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setPlayMode("menu");
    initializeGame();
  };

  const makeChoice = (playerId, choice) => {
    if (roundChoices[playerId] || showResults) return;

    setRoundChoices((prev) => ({
      ...prev,
      [playerId]: choice,
    }));

    // Hide this player's choice from others in local multiplayer
    if (playMode === "local") {
      setHiddenChoices((prev) => {
        const newHidden = { ...prev };
        players.forEach((p) => {
          if (p.id !== playerId) {
            newHidden[p.id] = { ...newHidden[p.id], [playerId]: true };
          }
        });
        return newHidden;
      });
    }

    // Auto-make computer choice in computer mode
    if (playMode === "computer" && playerId === 0) {
      setTimeout(() => {
        const computerChoice = getComputerChoice();
        setRoundChoices((prev) => ({
          ...prev,
          1: computerChoice,
        }));
      }, 500);
    }
  };

  const allPlayersMadeChoices = () => {
    const activePlayers = players.filter((p) => !p.eliminated);
    return activePlayers.every(
      (player) => roundChoices[player.id] !== undefined
    );
  };

  const getWinner = (choice1, choice2) => {
    if (choice1 === choice2) return "tie";
    if (
      (choice1 === "rock" && choice2 === "scissors") ||
      (choice1 === "paper" && choice2 === "rock") ||
      (choice1 === "scissors" && choice2 === "paper")
    ) {
      return "player1";
    }
    return "player2";
  };

  const processRound = () => {
    if (!allPlayersMadeChoices()) return;

    const activePlayers = players.filter((p) => !p.eliminated);
    const roundResult = {
      round: currentRound,
      choices: { ...roundChoices },
      winners: [],
      ties: [],
    };

    if (playMode === "computer") {
      // Simple 1v1 logic
      const result = getWinner(roundChoices[0], roundChoices[1]);
      if (result === "player1") {
        setPlayerScore((prev) => prev + 1);
        roundResult.winners = [0];
      } else if (result === "player2") {
        setComputerScore((prev) => prev + 1);
        roundResult.winners = [1];
      } else {
        roundResult.ties = [0, 1];
      }

      // Check for winner (first to 5)
      if (playerScore + (result === "player1" ? 1 : 0) >= 5) {
        setWinner(players[0]);
      } else if (computerScore + (result === "player2" ? 1 : 0) >= 5) {
        setWinner(players[1]);
      }
    } else {
      // Original multiplayer logic
      if (gameMode === "tournament") {
        const newPlayers = [...players];

        activePlayers.forEach((player1) => {
          let roundWins = 0;
          activePlayers.forEach((player2) => {
            if (player1.id !== player2.id) {
              const result = getWinner(
                roundChoices[player1.id],
                roundChoices[player2.id]
              );
              if (result === "player1") {
                roundWins++;
              }
            }
          });

          newPlayers[player1.id].score += roundWins;
          if (roundWins > 0) {
            newPlayers[player1.id].wins++;
            roundResult.winners.push(player1.id);
          }
        });

        setPlayers(newPlayers);

        const maxScore = Math.max(...newPlayers.map((p) => p.score));
        if (maxScore >= 10 || currentRound >= 10) {
          const tournamentWinner = newPlayers.find((p) => p.score === maxScore);
          setWinner(tournamentWinner);
        }
      } else {
        // Elimination logic (unchanged)
        const choiceGroups = {};
        activePlayers.forEach((player) => {
          const choice = roundChoices[player.id];
          if (!choiceGroups[choice]) choiceGroups[choice] = [];
          choiceGroups[choice].push(player);
        });

        const choiceTypes = Object.keys(choiceGroups);

        if (choiceTypes.length === 1) {
          roundResult.ties = activePlayers.map((p) => p.id);
        } else if (choiceTypes.length === 2) {
          const [choice1, choice2] = choiceTypes;
          const result = getWinner(choice1, choice2);

          if (result === "tie") {
            roundResult.ties = activePlayers.map((p) => p.id);
          } else {
            const winningChoice = result === "player1" ? choice1 : choice2;
            const losingChoice = result === "player1" ? choice2 : choice1;

            roundResult.winners = choiceGroups[winningChoice].map((p) => p.id);

            const newPlayers = [...players];
            choiceGroups[losingChoice].forEach((player) => {
              newPlayers[player.id].eliminated = true;
            });
            setPlayers(newPlayers);
          }
        } else {
          roundResult.ties = activePlayers.map((p) => p.id);
        }

        const remainingPlayers = players.filter((p) => !p.eliminated);
        if (remainingPlayers.length === 1) {
          setWinner(remainingPlayers[0]);
        }
      }
    }

    setRoundResults(roundResult);
    setGameHistory((prev) => [...prev, roundResult]);
    setShowResults(true);
    setHiddenChoices({}); // Reveal all choices when showing results

    setTimeout(() => {
      nextRound();
    }, 3000);
  };

  const nextRound = () => {
    setCurrentRound((prev) => prev + 1);
    setRoundChoices({});
    setRoundResults(null);
    setShowResults(false);
    setHiddenChoices({});
  };

  // Create online room
  const createRoom = () => {
    const newRoomCode = generateRoomCode();
    setRoomCode(newRoomCode);
    setIsRoomCreator(true);
    setConnectedPlayers([{ id: 0, name: "You", color: "bg-blue-500" }]);
  };

  // Join online room
  const joinRoom = (code) => {
    setRoomCode(code);
    setIsRoomCreator(false);
    // Simulate joining - in real implementation, this would connect to a server
    setConnectedPlayers([
      { id: 0, name: "Host", color: "bg-red-500" },
      { id: 1, name: "You", color: "bg-blue-500" },
    ]);
  };

  // Copy room code to clipboard
  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy room code");
    }
  };

  useEffect(() => {
    if (gameStarted && allPlayersMadeChoices() && !showResults) {
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            processRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [roundChoices, gameStarted, showResults]);

  const ChoiceButton = ({ choice, playerId, disabled }) => {
    const isSelected = roundChoices[playerId] === choice.name;

    return (
      <button
        onClick={() => makeChoice(playerId, choice.name)}
        disabled={disabled || isSelected}
        className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 ${
          isSelected
            ? "border-blue-500 bg-blue-50 scale-105"
            : disabled
            ? "border-gray-300 bg-gray-100 cursor-not-allowed"
            : "border-gray-400 bg-white hover:border-gray-600 hover:scale-105 cursor-pointer"
        }`}
      >
        <div className="text-2xl mb-1">{choice.icon}</div>
        <div className="text-xs font-medium text-gray-700">{choice.name}</div>
      </button>
    );
  };

  const PlayerCard = ({ player }) => {
    const hasChosen = roundChoices[player.id] !== undefined;
    const isEliminated = player.eliminated;
    const isLocalMultiplayer = playMode === "local";
    const isCurrentPlayerHidden = hiddenChoices[player.id] || {};

    return (
      <div
        className={`bg-white rounded-xl border-2 p-4 transition-all duration-200 ${
          isEliminated
            ? "border-gray-300 opacity-50"
            : hasChosen
            ? "border-green-500 bg-green-50"
            : "border-gray-400"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-6 h-6 ${player.color} rounded-full ${
                isEliminated ? "opacity-50" : ""
              }`}
            ></div>
            <div>
              <h3
                className={`font-semibold ${
                  isEliminated ? "text-gray-500" : "text-gray-800"
                }`}
              >
                {player.name}
                {player.isComputer && <Bot size={16} className="inline ml-1" />}
              </h3>
              <div className="text-sm text-gray-600">
                {playMode === "computer"
                  ? `Wins: ${player.id === 0 ? playerScore : computerScore}`
                  : gameMode === "tournament"
                  ? `Score: ${player.score}`
                  : isEliminated
                  ? "Eliminated"
                  : "Active"}
              </div>
            </div>
          </div>

          {hasChosen && !showResults && (
            <div className="text-green-500">
              <Zap size={20} />
            </div>
          )}
        </div>

        {showResults && roundChoices[player.id] && (
          <div className="text-center mb-3">
            <div className="text-3xl mb-1">
              {choices.find((c) => c.name === roundChoices[player.id])?.icon}
            </div>
            <div className="text-sm font-medium capitalize">
              {roundChoices[player.id]}
            </div>
          </div>
        )}

        {!isEliminated && !showResults && !player.isComputer && (
          <div className="grid grid-cols-3 gap-2">
            {choices.map((choice) => (
              <ChoiceButton
                key={choice.name}
                choice={choice}
                playerId={player.id}
                disabled={hasChosen || countdown > 0}
              />
            ))}
          </div>
        )}

        {isLocalMultiplayer && hasChosen && !showResults && (
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-center">
            <EyeOff size={14} className="mr-1" />
            <span>Hidden from others</span>
          </div>
        )}

        {showResults && roundResults && (
          <div className="text-center mt-2">
            {roundResults.winners.includes(player.id) && (
              <div className="text-green-600 font-semibold">Winner! 🎉</div>
            )}
            {roundResults.ties.includes(player.id) && (
              <div className="text-yellow-600 font-semibold">Tie 🤝</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Main menu
  if (playMode === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Rock Paper Scissors
            </h1>
            <div className="text-6xl mb-4">✊✋✌️</div>
            <p className="text-gray-600">Choose your game mode</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setPlayMode("computer")}
              className="w-full bg-red-500 text-white py-4 px-6 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-3"
            >
              <Bot size={24} />
              <span>Play vs Computer</span>
            </button>

            <button
              onClick={() => setPlayMode("local")}
              className="w-full bg-green-500 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-3"
            >
              <Home size={24} />
              <span>Local Multiplayer</span>
            </button>

            <button
              onClick={() => setPlayMode("online")}
              className="w-full bg-blue-500 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-3"
            >
              <Wifi size={24} />
              <span>Online Multiplayer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Computer mode setup
  if (playMode === "computer" && !gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Bot size={48} className="mx-auto mb-4 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Play vs Computer
            </h1>
            <p className="text-gray-600">First to 5 wins!</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Computer Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["easy", "medium", "hard"].map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setComputerDifficulty(difficulty)}
                    className={`p-3 rounded-lg border-2 font-medium transition-colors capitalize ${
                      computerDifficulty === difficulty
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={startGame}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Play size={20} />
                <span>Start Game</span>
              </button>

              <button
                onClick={() => setPlayMode("menu")}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Online mode setup
  if (playMode === "online" && !gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Wifi size={48} className="mx-auto mb-4 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Online Multiplayer
            </h1>
            <p className="text-gray-600">Play with friends online</p>
          </div>

          {!roomCode ? (
            <div className="space-y-4">
              <button
                onClick={createRoom}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Share2 size={20} />
                <span>Create Room</span>
              </button>

              <div className="text-center text-gray-500">or</div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter room code"
                  className="w-full p-3 border border-gray-300 rounded-lg text-center uppercase"
                  onChange={(e) => {
                    if (e.target.value.length === 6) {
                      joinRoom(e.target.value.toUpperCase());
                    }
                  }}
                  maxLength={6}
                />
              </div>

              <button
                onClick={() => setPlayMode("menu")}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Back to Menu
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 mb-2">Room Code</div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl font-mono font-bold text-blue-800">
                    {roomCode}
                  </span>
                  <button
                    onClick={copyRoomCode}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                {copySuccess && (
                  <div className="text-xs text-green-600 mt-1">Copied!</div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Connected Players:
                </div>
                <div className="space-y-2">
                  {connectedPlayers.map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-4 h-4 ${player.color} rounded-full`}
                      ></div>
                      <span className="font-medium">{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                Note: This is a demo. In a real implementation, this would
                connect to a multiplayer server.
              </div>

              <div className="space-y-2">
                <button
                  onClick={startGame}
                  disabled={connectedPlayers.length < 2}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
                >
                  <Play size={20} />
                  <span>Start Game</span>
                </button>

                <button
                  onClick={() => {
                    setRoomCode("");
                    setConnectedPlayers([]);
                    setPlayMode("menu");
                  }}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Local multiplayer setup
  if (playMode === "local" && !gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Users size={48} className="mx-auto mb-4 text-green-500" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Local Multiplayer
            </h1>
            <p className="text-gray-600">
              Play with friends on the same device
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Number of Players
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 4, 6, 8].map((count) => (
                  <button
                    key={count}
                    onClick={() => setPlayerCount(count)}
                    className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                      playerCount === count
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {count}P
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Game Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setGameMode("tournament")}
                  className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                    gameMode === "tournament"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <Trophy size={16} className="mx-auto mb-1" />
                  <div className="text-xs">Tournament</div>
                </button>
                <button
                  onClick={() => setGameMode("elimination")}
                  className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                    gameMode === "elimination"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <Zap size={16} className="mx-auto mb-1" />
                  <div className="text-xs">Elimination</div>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Players:
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: playerCount }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 ${playerColors[playerCount][i]} rounded-full`}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {playerNames[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Play size={20} />
              <span>Start Game</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Rock Paper Scissors
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-gray-600">Round {currentRound}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600 capitalize">
                  {gameMode} Mode
                </span>
                {playMode === "local" && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">Local Multiplayer</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={resetGame}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Countdown */}
        {countdown > 0 && (
          <div className="bg-yellow-100 border border-yellow-400 rounded-xl p-4 mb-6 text-center">
            <div className="text-2xl font-bold text-yellow-800">
              Revealing results in {countdown}...
            </div>
          </div>
        )}

        {/* Winner announcement */}
        {winner && (
          <div className="bg-green-100 border border-green-400 rounded-xl p-6 mb-6 text-center">
            <div className="text-3xl mb-4">🎉🏆🎉</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Game Over!
            </h2>
            <div className="flex items-center justify-center space-x-3">
              <div className={`w-8 h-8 ${winner.color} rounded-full`}></div>
              <span className="text-xl font-semibold text-green-800">
                {winner.name} wins the game!
              </span>
            </div>
            {gameMode === "tournament" && (
              <div className="text-green-700 mt-2">
                Final Score: {winner.score} points
              </div>
            )}
          </div>
        )}

        {/* Players grid */}
        <div
          className={`grid gap-4 mb-6 ${
            playerCount <= 2
              ? "grid-cols-1 md:grid-cols-2"
              : playerCount <= 4
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              : playerCount <= 6
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>

        {/* Game status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Game Status
          </h3>

          {gameMode === "tournament" ? (
            <div>
              <div className="text-sm text-gray-600 mb-2">Leaderboard:</div>
              <div className="space-y-2">
                {[...players]
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          #{index + 1}
                        </span>
                        <div
                          className={`w-4 h-4 ${player.color} rounded-full`}
                        ></div>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {player.score} points
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-sm text-gray-600 mb-2">
                Remaining Players:
              </div>
              <div className="flex flex-wrap gap-2">
                {players
                  .filter((p) => !p.eliminated)
                  .map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center space-x-2"
                    >
                      <div
                        className={`w-4 h-4 ${player.color} rounded-full`}
                      ></div>
                      <span className="text-sm font-medium">{player.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!showResults && !winner && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Instructions:</strong> Each player selects Rock, Paper,
                or Scissors.
                {gameMode === "tournament"
                  ? " Players earn points for each opponent they beat. First to 10 points wins!"
                  : " Losing players are eliminated each round. Last player standing wins!"}
                {playMode === "local" && (
                  <div className="mt-2">
                    <strong>Note:</strong> Your choice will be hidden from other
                    players until all choices are revealed.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RockPaperScissorsGame;
