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

    // Color schemes for players
    const playerColors = {
        2: ['bg-red-500', 'bg-blue-500'],
        4: ['bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-blue-500']
    };

    const playerBorders = {
        2: ['border-red-600', 'border-blue-600'],
        4: ['border-red-600', 'border-green-600', 'border-yellow-600', 'border-blue-600']
    };

    const playerNames = ['Red', 'Green', 'Yellow', 'Blue'];

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
            // Move piece out of home to starting position
            piece.position = playerId * 13; // Each player starts at different positions
            piece.homeIndex = -1;
        } else if (piece.position !== 'home' && piece.position !== 'finished') {
            // Move piece forward
            let newPosition = piece.position + diceValue;
            
            // Handle going around the board (52 positions on the outer track)
            if (newPosition >= 52) {
                newPosition = newPosition - 52;
            }
            
            // Check if piece is entering home stretch
            const homeStretchStart = (playerId * 13 + 51) % 52;
            if (piece.position < homeStretchStart && newPosition >= homeStretchStart) {
                // Entering home stretch
                const homeStretchPosition = newPosition - homeStretchStart + 52;
                if (homeStretchPosition >= 58) {
                    // Reached finish
                    piece.position = 'finished';
                    newGameState[playerId].finishedPieces++;

                    // Check for winner
                    if (newGameState[playerId].finishedPieces === 4) {
                        setWinner(playerId);
                    }
                } else {
                    piece.position = homeStretchPosition;
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

    // Get position coordinates for pieces on the board
    const getPositionCoords = (position, playerId) => {
        if (position === 'home' || position === 'finished') return null;

        // Board is 15x15 grid
        const boardSize = 15;
        const cellSize = 100 / boardSize;

        // Outer track positions (52 positions)
        if (position < 52) {
            const outerTrack = [
                // Bottom row (left to right)
                [6, 14], [5, 14], [4, 14], [3, 14], [2, 14], [1, 14],
                // Left column (bottom to top)
                [0, 14], [0, 13], [0, 12], [0, 11], [0, 10], [0, 9],
                [0, 8], [0, 7], [0, 6],
                // Top-left to center-left
                [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6],
                // Top row (left to right)
                [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
                // Top column (left to right)
                [7, 0], [8, 0],
                // Right side top
                [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6],
                // Top-right to center-right
                [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
                // Right column (top to bottom)
                [14, 7], [14, 8],
                // Right side bottom
                [14, 8], [14, 9], [14, 10], [14, 11], [14, 12], [14, 13], [14, 14],
                // Bottom-right to center-right
                [13, 8], [12, 8], [11, 8], [10, 8], [9, 8], [8, 8],
                // Bottom row (right to left)
                [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
                // Return to start
                [7, 14], [7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]
            ];

            if (outerTrack[position]) {
                const [x, y] = outerTrack[position];
                return {
                    left: `${x * cellSize + cellSize/2}%`,
                    top: `${y * cellSize + cellSize/2}%`
                };
            }
        }
        
        // Home stretch positions (52-57)
        if (position >= 52 && position < 58) {
            const homeStretchPos = position - 52;
            const homeStretches = [
                // Red home stretch (bottom to center)
                [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
                // Green home stretch (left to center)
                [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
                // Yellow home stretch (top to center)
                [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
                // Blue home stretch (right to center)
                [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]]
            ];

            if (homeStretches[playerId] && homeStretches[playerId][homeStretchPos]) {
                const [x, y] = homeStretches[playerId][homeStretchPos];
                return {
                    left: `${x * cellSize + cellSize/2}%`,
                    top: `${y * cellSize + cellSize/2}%`
                };
            }
        }

        return null;
    };

    // Game board component
    const GameBoard = () => {
        return (
            <div className="w-[600px] h-[600px] bg-white border-4 border-gray-800 relative mx-auto">
                {/* Create the classic Ludo board grid */}
                <div className="absolute inset-0 grid grid-cols-15 grid-rows-15">
                    {Array.from({ length: 225 }).map((_, i) => {
                        const row = Math.floor(i / 15);
                        const col = i % 15;
                        
                        // Determine cell color and type
                        let cellClass = "border border-gray-300 ";
                        
                        // Home areas
                        if ((row >= 1 && row <= 5 && col >= 1 && col <= 5)) {
                            cellClass += "bg-red-200"; // Red home
                        } else if ((row >= 1 && row <= 5 && col >= 9 && col <= 13)) {
                            cellClass += "bg-green-200"; // Green home
                        } else if ((row >= 9 && row <= 13 && col >= 1 && col <= 5)) {
                            cellClass += "bg-yellow-200"; // Yellow home
                        } else if ((row >= 9 && row <= 13 && col >= 9 && col <= 13)) {
                            cellClass += "bg-blue-200"; // Blue home
                        }
                        // Safe spots (star positions)
                        else if ((row === 6 && col === 2) || (row === 2 && col === 6) || 
                                (row === 6 && col === 12) || (row === 12 && col === 6) ||
                                (row === 8 && col === 2) || (row === 2 && col === 8) ||
                                (row === 8 && col === 12) || (row === 12 && col === 8)) {
                            cellClass += "bg-gray-200"; // Safe spots
                        }
                        // Home stretches
                        else if (row === 7 && col >= 1 && col <= 6) {
                            cellClass += "bg-green-100"; // Green home stretch
                        } else if (row === 7 && col >= 8 && col <= 13) {
                            cellClass += "bg-blue-100"; // Blue home stretch
                        } else if (col === 7 && row >= 1 && row <= 6) {
                            cellClass += "bg-yellow-100"; // Yellow home stretch
                        } else if (col === 7 && row >= 8 && row <= 13) {
                            cellClass += "bg-red-100"; // Red home stretch
                        }
                        // Center finish area
                        else if (row === 7 && col === 7) {
                            cellClass += "bg-gray-300"; // Center
                        }
                        // Main track
                        else if ((row >= 6 && row <= 8) || (col >= 6 && col <= 8)) {
                            cellClass += "bg-white"; // Main track
                        }
                        // Outside areas
                        else {
                            cellClass += "bg-gray-100";
                        }

                        return <div key={i} className={cellClass}></div>;
                    })}
                </div>

                {/* Home areas with pieces */}
                {playerCount === 4 && (
                    <>
                        {/* Red home (bottom-left) */}
                        <div className="absolute" style={{ left: '6.67%', top: '66.67%', width: '26.67%', height: '26.67%' }}>
                            <div className="w-full h-full bg-red-300 border-2 border-red-600 rounded-lg grid grid-cols-2 gap-2 p-4">
                                {gameState[0]?.pieces.filter(p => p.position === 'home').map((piece, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 bg-red-500 border-2 border-red-700 rounded-full cursor-pointer hover:scale-110 transition-transform"
                                        onClick={() => movePiece(0, piece.id)}
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {/* Green home (top-left) */}
                        <div className="absolute" style={{ left: '6.67%', top: '6.67%', width: '26.67%', height: '26.67%' }}>
                            <div className="w-full h-full bg-green-300 border-2 border-green-600 rounded-lg grid grid-cols-2 gap-2 p-4">
                                {gameState[1]?.pieces.filter(p => p.position === 'home').map((piece, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 bg-green-500 border-2 border-green-700 rounded-full cursor-pointer hover:scale-110 transition-transform"
                                        onClick={() => movePiece(1, piece.id)}
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {/* Yellow home (top-right) */}
                        <div className="absolute" style={{ left: '66.67%', top: '6.67%', width: '26.67%', height: '26.67%' }}>
                            <div className="w-full h-full bg-yellow-300 border-2 border-yellow-600 rounded-lg grid grid-cols-2 gap-2 p-4">
                                {gameState[2]?.pieces.filter(p => p.position === 'home').map((piece, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 bg-yellow-500 border-2 border-yellow-600 rounded-full cursor-pointer hover:scale-110 transition-transform"
                                        onClick={() => movePiece(2, piece.id)}
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {/* Blue home (bottom-right) */}
                        <div className="absolute" style={{ left: '66.67%', top: '66.67%', width: '26.67%', height: '26.67%' }}>
                            <div className="w-full h-full bg-blue-300 border-2 border-blue-600 rounded-lg grid grid-cols-2 gap-2 p-4">
                                {gameState[3]?.pieces.filter(p => p.position === 'home').map((piece, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 bg-blue-500 border-2 border-blue-700 rounded-full cursor-pointer hover:scale-110 transition-transform"
                                        onClick={() => movePiece(3, piece.id)}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Center finish area */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-400 border-2 border-gray-800 rounded-full flex items-center justify-center">
                    <div className="text-xs font-bold text-gray-800 text-center">FINISH</div>
                </div>

                {/* Pieces on track */}
                {Object.entries(gameState).map(([playerId, player]) =>
                    player.pieces.map((piece, pieceIndex) => {
                        if (piece.position !== 'home' && piece.position !== 'finished') {
                            const coords = getPositionCoords(piece.position, parseInt(playerId));
                            if (!coords) return null;

                            return (
                                <div
                                    key={`${playerId}-${pieceIndex}`}
                                    className="absolute w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform border-2"
                                    style={{
                                        left: coords.left,
                                        top: coords.top,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    onClick={() => movePiece(parseInt(playerId), pieceIndex)}
                                >
                                    <div className={`w-full h-full ${playerColors[playerCount] ? playerColors[playerCount][parseInt(playerId)] : 'bg-gray-500'} ${playerBorders[playerCount] ? playerBorders[playerCount][parseInt(playerId)] : 'border-gray-600'} rounded-full border-2`}></div>
                                </div>
                            );
                        }
                        return null;
                    })
                )}

                {/* Finished pieces display */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none">
                    {Object.entries(gameState).map(([playerId, player]) => {
                        const finishedPieces = player.pieces.filter(p => p.position === 'finished');
                        return finishedPieces.map((piece, i) => (
                            <div
                                key={`finished-${playerId}-${i}`}
                                className={`absolute w-3 h-3 ${playerColors[playerCount] ? playerColors[playerCount][parseInt(playerId)] : 'bg-gray-500'} rounded-full`}
                                style={{
                                    left: `${25 + (i % 2) * 50}%`,
                                    top: `${25 + Math.floor(i / 2) * 50}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            ></div>
                        ));
                    })}
                </div>
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
                            <div className="grid grid-cols-2 gap-2">
                                {[2, 4].map((count) => (
                                    <button
                                        key={count}
                                        onClick={() => setPlayerCount(count)}
                                        className={`p-3 rounded-lg border-2 font-medium transition-colors ${playerCount === count
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                            }`}
                                    >
                                        {count} Players
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
                                <div className={`w-8 h-8 ${playerColors[playerCount][currentPlayer]} rounded-full border-2 ${playerBorders[playerCount][currentPlayer]}`}></div>
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
                                            <div className={`w-4 h-4 ${playerColors[playerCount][i]} rounded-full border ${playerBorders[playerCount][i]}`}></div>
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
                                    <div className={`w-6 h-6 ${playerColors[playerCount][winner]} rounded-full border-2 ${playerBorders[playerCount][winner]}`}></div>
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