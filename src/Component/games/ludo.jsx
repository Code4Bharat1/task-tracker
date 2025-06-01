import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Users, RotateCcw, Play } from 'lucide-react';

const LudoGame = () => {
    const [playerCount, setPlayerCount] = useState(4);
    const [gameStarted, setGameStarted] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [diceValue, setDiceValue] = useState(1);
    const [isRolling, setIsRolling] = useState(false);
    const [gameState, setGameState] = useState({});
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [winner, setWinner] = useState(null);

    // Color schemes for different player counts
    const playerColors = {
        2: ['bg-red-500', 'bg-blue-500'],
        4: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'],
        6: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-orange-500'],
        8: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']
    };

    const playerNames = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Indigo'];

    // Initialize game state
    const initializeGame = () => {
        const state = {};
        for (let i = 0; i < playerCount; i++) {
            state[i] = {
                pieces: [
                    { id: 0, position: 'home', homeIndex: 0 },
                    { id: 1, position: 'home', homeIndex: 1 },
                    { id: 2, position: 'home', homeIndex: 2 },
                    { id: 3, position: 'home', homeIndex: 3 }
                ],
                finishedPieces: 0
            };
        }
        setGameState(state);
        setCurrentPlayer(0);
        setWinner(null);
        setSelectedPiece(null);
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

    // Roll dice
    const rollDice = () => {
        if (isRolling) return;

        setIsRolling(true);
        const rollAnimation = setInterval(() => {
            setDiceValue(Math.floor(Math.random() * 6) + 1);
        }, 100);

        setTimeout(() => {
            clearInterval(rollAnimation);
            const finalValue = Math.floor(Math.random() * 6) + 1;
            setDiceValue(finalValue);
            setIsRolling(false);
            handleDiceRoll(finalValue);
        }, 1000);
    };

    // Handle dice roll logic
    const handleDiceRoll = (value) => {
        const player = gameState[currentPlayer];
        const canMoveFromHome = value === 6;
        const piecesInPlay = player.pieces.filter(p => p.position !== 'home' && p.position !== 'finished');

        // Check if player can make any moves
        if (!canMoveFromHome && piecesInPlay.length === 0) {
            // No moves possible, switch to next player
            setTimeout(() => {
                setCurrentPlayer((currentPlayer + 1) % playerCount);
            }, 1500);
        }
    };

    // Move piece
    const movePiece = (playerId, pieceId) => {
        if (playerId !== currentPlayer) return;

        const newGameState = { ...gameState };
        const piece = newGameState[playerId].pieces[pieceId];

        if (piece.position === 'home' && diceValue === 6) {
            // Move piece out of home
            piece.position = 0;
            piece.homeIndex = -1;
        } else if (piece.position !== 'home' && piece.position !== 'finished') {
            // Move piece forward
            const newPosition = piece.position + diceValue;
            if (newPosition >= 57) {
                piece.position = 'finished';
                newGameState[playerId].finishedPieces++;

                // Check for winner
                if (newGameState[playerId].finishedPieces === 4) {
                    setWinner(playerId);
                }
            } else {
                piece.position = newPosition;
            }
        }

        setGameState(newGameState);
        setSelectedPiece(null);

        // Switch to next player (unless rolled 6)
        if (diceValue !== 6) {
            setTimeout(() => {
                setCurrentPlayer((currentPlayer + 1) % playerCount);
            }, 500);
        }
    };

    // Dice component
    const DiceComponent = ({ value }) => {
        const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
        const DiceIcon = diceIcons[value - 1];

        return (
            <div className={`w-16 h-16 border-2 border-gray-800 rounded-lg flex items-center justify-center bg-white ${isRolling ? 'animate-spin' : ''}`}>
                <DiceIcon size={32} className="text-gray-800" />
            </div>
        );
    };

    // Game board component
    const GameBoard = () => {
        const getBoardSize = () => {
            switch (playerCount) {
                case 2: return 'w-96 h-96';
                case 4: return 'w-[500px] h-[500px]';
                case 6: return 'w-[600px] h-[600px]';
                case 8: return 'w-[700px] h-[700px]';
                default: return 'w-[500px] h-[500px]';
            }
        };

        return (
            <div className={`${getBoardSize()} border-4 border-gray-800 bg-white relative mx-auto`}>
                {/* Home areas */}
                {Array.from({ length: playerCount }).map((_, playerIndex) => {
                    const angle = (360 / playerCount) * playerIndex;
                    const homePositions = {
                        2: [
                            { top: '10%', left: '10%' },
                            { bottom: '10%', right: '10%' }
                        ],
                        4: [
                            { top: '10%', left: '10%' },
                            { top: '10%', right: '10%' },
                            { bottom: '10%', right: '10%' },
                            { bottom: '10%', left: '10%' }
                        ],
                        6: [
                            { top: '5%', left: '20%' },
                            { top: '5%', right: '20%' },
                            { top: '40%', right: '5%' },
                            { bottom: '5%', right: '20%' },
                            { bottom: '5%', left: '20%' },
                            { top: '40%', left: '5%' }
                        ],
                        8: [
                            { top: '5%', left: '25%' },
                            { top: '5%', right: '25%' },
                            { top: '25%', right: '5%' },
                            { bottom: '25%', right: '5%' },
                            { bottom: '5%', right: '25%' },
                            { bottom: '5%', left: '25%' },
                            { bottom: '25%', left: '5%' },
                            { top: '25%', left: '5%' }
                        ]
                    };

                    const position = homePositions[playerCount][playerIndex];

                    return (
                        <div
                            key={playerIndex}
                            className={`absolute w-20 h-20 ${playerColors[playerCount][playerIndex]} border-2 border-gray-800 rounded-lg`}
                            style={position}
                        >
                            <div className="grid grid-cols-2 gap-1 p-2 h-full">
                                {gameState[playerIndex]?.pieces.map((piece, pieceIndex) => (
                                    piece.position === 'home' && (
                                        <div
                                            key={pieceIndex}
                                            className="w-6 h-6 bg-white border border-gray-600 rounded-full cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                                            onClick={() => movePiece(playerIndex, pieceIndex)}
                                        >
                                            <div className={`w-4 h-4 ${playerColors[playerCount][playerIndex]} rounded-full`}></div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Center finish area */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-200 border-2 border-gray-800 rounded-full flex items-center justify-center">
                    <div className="text-sm font-bold text-gray-800">FINISH</div>
                </div>

                {/* Track pieces */}
                {Object.entries(gameState).map(([playerId, player]) =>
                    player.pieces.map((piece, pieceIndex) => {
                        if (piece.position !== 'home' && piece.position !== 'finished') {
                            // Calculate position on track (simplified)
                            const trackPosition = piece.position % 56;
                            const angle = (trackPosition / 56) * 360;
                            const radius = 180;
                            const x = Math.cos((angle * Math.PI) / 180) * radius + 50;
                            const y = Math.sin((angle * Math.PI) / 180) * radius + 50;

                            return (
                                <div
                                    key={`${playerId}-${pieceIndex}`}
                                    className="absolute w-6 h-6 bg-white border border-gray-600 rounded-full cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                                    style={{
                                        left: `${x}%`,
                                        top: `${y}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    onClick={() => movePiece(parseInt(playerId), pieceIndex)}
                                >
                                    <div className={`w-4 h-4 ${playerColors[playerCount][parseInt(playerId)]} rounded-full`}></div>
                                </div>
                            );
                        }
                        return null;
                    })
                )}
            </div>
        );
    };

    if (!gameStarted) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">Ludo Game</h1>
                        <Users size={48} className="mx-auto text-blue-600 mb-4" />
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
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-800">Ludo Game</h1>
                        <button
                            onClick={resetGame}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                        >
                            <RotateCcw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Game Board */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <GameBoard />
                        </div>
                    </div>

                    {/* Game Controls */}
                    <div className="space-y-6">
                        {/* Current Player */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Turn</h3>
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 ${playerColors[playerCount][currentPlayer]} rounded-full`}></div>
                                <span className="text-xl font-medium text-gray-800">
                                    {playerNames[currentPlayer]}
                                </span>
                            </div>
                        </div>

                        {/* Dice */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dice</h3>
                            <div className="flex flex-col items-center space-y-4">
                                <DiceComponent value={diceValue} />
                                <button
                                    onClick={rollDice}
                                    disabled={isRolling}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                                >
                                    {isRolling ? 'Rolling...' : 'Roll Dice'}
                                </button>
                            </div>
                        </div>

                        {/* Player Status */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Player Status</h3>
                            <div className="space-y-3">
                                {Array.from({ length: playerCount }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-4 h-4 ${playerColors[playerCount][i]} rounded-full`}></div>
                                            <span className="text-sm font-medium">{playerNames[i]}</span>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {gameState[i]?.finishedPieces || 0}/4 finished
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Winner */}
                        {winner !== null && (
                            <div className="bg-green-100 border border-green-400 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-green-800 mb-2">🎉 Winner!</h3>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-6 h-6 ${playerColors[playerCount][winner]} rounded-full`}></div>
                                    <span className="text-green-800 font-medium">{playerNames[winner]} wins!</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LudoGame;