import React, { useState, useEffect } from 'react';
import { Users, RotateCcw, Play, Trophy, Zap, Hand, Scissors } from 'lucide-react';

const RockPaperScissorsGame = () => {
    const [playerCount, setPlayerCount] = useState(4);
    const [gameStarted, setGameStarted] = useState(false);
    const [currentRound, setCurrentRound] = useState(1);
    const [gameMode, setGameMode] = useState('tournament'); // 'tournament' or 'elimination'
    const [players, setPlayers] = useState([]);
    const [roundChoices, setRoundChoices] = useState({});
    const [roundResults, setRoundResults] = useState(null);
    const [gameHistory, setGameHistory] = useState([]);
    const [winner, setWinner] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Player colors and names
    const playerColors = {
        2: ['bg-red-500', 'bg-blue-500'],
        4: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'],
        6: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-orange-500'],
        8: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']
    };

    const playerNames = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Indigo'];

    const choices = [
        { name: 'rock', emoji: '🪨', icon: '✊' },
        { name: 'paper', emoji: '📄', icon: '✋' },
        { name: 'scissors', emoji: '✂️', icon: '✌️' }
    ];

    // Initialize game
    const initializeGame = () => {
        const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
            id: i,
            name: playerNames[i],
            color: playerColors[playerCount][i],
            score: 0,
            wins: 0,
            eliminated: false
        }));
        setPlayers(newPlayers);
        setRoundChoices({});
        setRoundResults(null);
        setGameHistory([]);
        setWinner(null);
        setShowResults(false);
        setCurrentRound(1);
    };

    // Start game
    const startGame = () => {
        initializeGame();
        setGameStarted(true);
    };

    // Reset game
    const resetGame = () => {
        setGameStarted(false);
        initializeGame();
    };

    // Make choice
    const makeChoice = (playerId, choice) => {
        if (roundChoices[playerId] || showResults) return;

        setRoundChoices(prev => ({
            ...prev,
            [playerId]: choice
        }));
    };

    // Check if all active players have made choices
    const allPlayersMadeChoices = () => {
        const activePlayers = players.filter(p => !p.eliminated);
        return activePlayers.every(player => roundChoices[player.id] !== undefined);
    };

    // Determine winner between two choices
    const getWinner = (choice1, choice2) => {
        if (choice1 === choice2) return 'tie';
        if (
            (choice1 === 'rock' && choice2 === 'scissors') ||
            (choice1 === 'paper' && choice2 === 'rock') ||
            (choice1 === 'scissors' && choice2 === 'paper')
        ) {
            return 'player1';
        }
        return 'player2';
    };

    // Process round results
    const processRound = () => {
        if (!allPlayersMadeChoices()) return;

        const activePlayers = players.filter(p => !p.eliminated);
        const roundResult = {
            round: currentRound,
            choices: { ...roundChoices },
            winners: [],
            ties: []
        };

        // Tournament mode - everyone plays, points for wins
        if (gameMode === 'tournament') {
            const newPlayers = [...players];

            // Calculate wins for each player against all others
            activePlayers.forEach(player1 => {
                let roundWins = 0;
                activePlayers.forEach(player2 => {
                    if (player1.id !== player2.id) {
                        const result = getWinner(roundChoices[player1.id], roundChoices[player2.id]);
                        if (result === 'player1') {
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

            // Check for tournament winner (first to 10 points or after 10 rounds)
            const maxScore = Math.max(...newPlayers.map(p => p.score));
            if (maxScore >= 10 || currentRound >= 10) {
                const tournamentWinner = newPlayers.find(p => p.score === maxScore);
                setWinner(tournamentWinner);
            }
        }
        // Elimination mode - eliminate losers each round
        else {
            const choiceGroups = {};
            activePlayers.forEach(player => {
                const choice = roundChoices[player.id];
                if (!choiceGroups[choice]) choiceGroups[choice] = [];
                choiceGroups[choice].push(player);
            });

            const choiceTypes = Object.keys(choiceGroups);

            if (choiceTypes.length === 1) {
                // Everyone chose the same - no eliminations
                roundResult.ties = activePlayers.map(p => p.id);
            } else if (choiceTypes.length === 2) {
                // Two different choices - clear winner
                const [choice1, choice2] = choiceTypes;
                const result = getWinner(choice1, choice2);

                if (result === 'tie') {
                    roundResult.ties = activePlayers.map(p => p.id);
                } else {
                    const winningChoice = result === 'player1' ? choice1 : choice2;
                    const losingChoice = result === 'player1' ? choice2 : choice1;

                    roundResult.winners = choiceGroups[winningChoice].map(p => p.id);

                    // Eliminate losers
                    const newPlayers = [...players];
                    choiceGroups[losingChoice].forEach(player => {
                        newPlayers[player.id].eliminated = true;
                    });
                    setPlayers(newPlayers);
                }
            } else {
                // Three different choices - all tie
                roundResult.ties = activePlayers.map(p => p.id);
            }

            // Check for elimination winner
            const remainingPlayers = players.filter(p => !p.eliminated);
            if (remainingPlayers.length === 1) {
                setWinner(remainingPlayers[0]);
            }
        }

        setRoundResults(roundResult);
        setGameHistory(prev => [...prev, roundResult]);
        setShowResults(true);

        // Auto advance to next round
        setTimeout(() => {
            nextRound();
        }, 3000);
    };

    // Next round
    const nextRound = () => {
        setCurrentRound(prev => prev + 1);
        setRoundChoices({});
        setRoundResults(null);
        setShowResults(false);
    };

    // Auto-process round when all choices are made
    useEffect(() => {
        if (gameStarted && allPlayersMadeChoices() && !showResults) {
            // Add countdown before showing results
            setCountdown(3);
            const countdownInterval = setInterval(() => {
                setCountdown(prev => {
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

    // Choice button component
    const ChoiceButton = ({ choice, playerId, disabled }) => {
        const isSelected = roundChoices[playerId] === choice.name;

        return (
            <button
                onClick={() => makeChoice(playerId, choice.name)}
                disabled={disabled || isSelected}
                className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 ${isSelected
                        ? 'border-blue-500 bg-blue-50 scale-105'
                        : disabled
                            ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                            : 'border-gray-400 bg-white hover:border-gray-600 hover:scale-105 cursor-pointer'
                    }`}
            >
                <div className="text-2xl mb-1">{choice.icon}</div>
                <div className="text-xs font-medium text-gray-700">{choice.name}</div>
            </button>
        );
    };

    // Player card component
    const PlayerCard = ({ player }) => {
        const hasChosen = roundChoices[player.id] !== undefined;
        const isEliminated = player.eliminated;

        return (
            <div className={`bg-white rounded-xl border-2 p-4 transition-all duration-200 ${isEliminated
                    ? 'border-gray-300 opacity-50'
                    : hasChosen
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-400'
                }`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 ${player.color} rounded-full ${isEliminated ? 'opacity-50' : ''}`}></div>
                        <div>
                            <h3 className={`font-semibold ${isEliminated ? 'text-gray-500' : 'text-gray-800'}`}>
                                {player.name}
                            </h3>
                            <div className="text-sm text-gray-600">
                                {gameMode === 'tournament' ? `Score: ${player.score}` : (isEliminated ? 'Eliminated' : 'Active')}
                            </div>
                        </div>
                    </div>

                    {hasChosen && !showResults && (
                        <div className="text-green-500">
                            <Zap size={20} />
                        </div>
                    )}
                </div>

                {/* Choice display */}
                {showResults && roundChoices[player.id] && (
                    <div className="text-center mb-3">
                        <div className="text-3xl mb-1">
                            {choices.find(c => c.name === roundChoices[player.id])?.icon}
                        </div>
                        <div className="text-sm font-medium capitalize">
                            {roundChoices[player.id]}
                        </div>
                    </div>
                )}

                {/* Choice buttons */}
                {!isEliminated && !showResults && (
                    <div className="grid grid-cols-3 gap-2">
                        {choices.map(choice => (
                            <ChoiceButton
                                key={choice.name}
                                choice={choice}
                                playerId={player.id}
                                disabled={hasChosen || countdown > 0}
                            />
                        ))}
                    </div>
                )}

                {/* Result indicator */}
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

    if (!gameStarted) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">Rock Paper Scissors</h1>
                        <div className="text-6xl mb-4">✊✋✌️</div>
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
                                        className={`p-3 rounded-lg border-2 font-medium transition-colors ${playerCount === count
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
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
                                    onClick={() => setGameMode('tournament')}
                                    className={`p-3 rounded-lg border-2 font-medium transition-colors ${gameMode === 'tournament'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                        }`}
                                >
                                    <Trophy size={16} className="mx-auto mb-1" />
                                    <div className="text-xs">Tournament</div>
                                </button>
                                <button
                                    onClick={() => setGameMode('elimination')}
                                    className={`p-3 rounded-lg border-2 font-medium transition-colors ${gameMode === 'elimination'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                        }`}
                                >
                                    <Zap size={16} className="mx-auto mb-1" />
                                    <div className="text-xs">Elimination</div>
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Players:</h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: playerCount }).map((_, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <div className={`w-4 h-4 ${playerColors[playerCount][i]} rounded-full`}></div>
                                        <span className="text-sm text-gray-600">{playerNames[i]}</span>
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
                            <h1 className="text-3xl font-bold text-gray-800">Rock Paper Scissors</h1>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className="text-gray-600">Round {currentRound}</span>
                                <span className="text-gray-600">•</span>
                                <span className="text-gray-600 capitalize">{gameMode} Mode</span>
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
                        <h2 className="text-2xl font-bold text-green-800 mb-2">Game Over!</h2>
                        <div className="flex items-center justify-center space-x-3">
                            <div className={`w-8 h-8 ${winner.color} rounded-full`}></div>
                            <span className="text-xl font-semibold text-green-800">
                                {winner.name} wins the game!
                            </span>
                        </div>
                        {gameMode === 'tournament' && (
                            <div className="text-green-700 mt-2">Final Score: {winner.score} points</div>
                        )}
                    </div>
                )}

                {/* Players grid */}
                <div className={`grid gap-4 mb-6 ${playerCount <= 2 ? 'grid-cols-1 md:grid-cols-2' :
                        playerCount <= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                            playerCount <= 6 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                                'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                    }`}>
                    {players.map(player => (
                        <PlayerCard key={player.id} player={player} />
                    ))}
                </div>

                {/* Game status */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Game Status</h3>

                    {gameMode === 'tournament' ? (
                        <div>
                            <div className="text-sm text-gray-600 mb-2">Leaderboard:</div>
                            <div className="space-y-2">
                                {[...players]
                                    .sort((a, b) => b.score - a.score)
                                    .map((player, index) => (
                                        <div key={player.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium">#{index + 1}</span>
                                                <div className={`w-4 h-4 ${player.color} rounded-full`}></div>
                                                <span className="font-medium">{player.name}</span>
                                            </div>
                                            <span className="text-sm text-gray-600">{player.score} points</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-sm text-gray-600 mb-2">Remaining Players:</div>
                            <div className="flex flex-wrap gap-2">
                                {players
                                    .filter(p => !p.eliminated)
                                    .map(player => (
                                        <div key={player.id} className="flex items-center space-x-2">
                                            <div className={`w-4 h-4 ${player.color} rounded-full`}></div>
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
                                <strong>Instructions:</strong> Each player selects Rock, Paper, or Scissors.
                                {gameMode === 'tournament'
                                    ? ' Players earn points for each opponent they beat. First to 10 points wins!'
                                    : ' Losing players are eliminated each round. Last player standing wins!'
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RockPaperScissorsGame;