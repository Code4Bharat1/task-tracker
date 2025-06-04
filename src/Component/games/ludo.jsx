import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Users, RotateCcw, Play } from 'lucide-react';

const LudoGame = () => {
    // Game state
    const [playerCount, setPlayerCount] = useState(4);
    const [gameStarted, setGameStarted] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [diceValue, setDiceValue] = useState(1);
    const [isRolling, setIsRolling] = useState(false);
    const [gameState, setGameState] = useState({});
    const [winner, setWinner] = useState(null);
    const [canRollAgain, setCanRollAgain] = useState(false);
    const [gameMessage, setGameMessage] = useState('');
    const [availableMoves, setAvailableMoves] = useState([]);
    const [waitingForPieceSelection, setWaitingForPieceSelection] = useState(false);

    // Player configuration
    const playerColors = {
        2: ['#ef4444', '#3b82f6'], // Red, Blue
        4: ['#ef4444', '#22c55e', '#eab308', '#3b82f6'], // Red, Green, Yellow, Blue
    };

    const playerNames = ['Red', 'Green', 'Yellow', 'Blue'];
    const playerStartPositions = [0, 13, 26, 39]; // Starting positions on the board
    const safePositions = [0, 8, 13, 21, 26, 34, 39, 47]; // Safe positions (star squares)

    // Board positions (52 positions in the outer loop)
    const boardPositions = [
        // Red path (bottom-left, moves clockwise)
        { x: 7.5, y: 86.5 },   // 0 - Red start (safe)
        { x: 14, y: 86.5 },     // 1
        { x: 20.5, y: 86.5 },   // 2
        { x: 27, y: 86.5 },     // 3
        { x: 33.5, y: 86.5 },   // 4
        { x: 40, y: 86.5 },     // 5
        { x: 46.5, y: 86.5 },   // 6
        { x: 53, y: 86.5 },     // 7
        { x: 59.5, y: 86.5 },    // 8 - Safe
        { x: 66, y: 86.5 },      // 9
        { x: 72.5, y: 86.5 },    // 10
        { x: 79, y: 86.5 },      // 11
        { x: 85.5, y: 86.5 },    // 12
        { x: 85.5, y: 80 },      // 13 - Green start
        { x: 85.5, y: 73.5 },    // 14
        { x: 85.5, y: 67 },      // 15
        { x: 85.5, y: 60.5 },    // 16
        { x: 85.5, y: 54 },      // 17
        { x: 85.5, y: 47.5 },    // 18
        { x: 85.5, y: 41 },      // 19
        { x: 85.5, y: 34.5 },    // 20
        { x: 85.5, y: 28 },      // 21 - Safe
        { x: 85.5, y: 21.5 },    // 22
        { x: 85.5, y: 15 },      // 23
        { x: 85.5, y: 8.5 },     // 24
        { x: 85.5, y: 2 },       // 25
        { x: 79, y: 2 },         // 26 - Yellow start
        { x: 72.5, y: 2 },       // 27
        { x: 66, y: 2 },         // 28
        { x: 59.5, y: 2 },       // 29
        { x: 53, y: 2 },         // 30
        { x: 46.5, y: 2 },       // 31
        { x: 40, y: 2 },         // 32
        { x: 33.5, y: 2 },       // 33
        { x: 27, y: 2 },         // 34 - Safe
        { x: 20.5, y: 2 },      // 35
        { x: 14, y: 2 },        // 36
        { x: 7.5, y: 2 },       // 37
        { x: 1, y: 2 },         // 38
        { x: 1, y: 8.5 },       // 39 - Blue start
        { x: 1, y: 15 },       // 40
        { x: 1, y: 21.5 },     // 41
        { x: 1, y: 28 },       // 42
        { x: 1, y: 34.5 },     // 43
        { x: 1, y: 41 },       // 44
        { x: 1, y: 47.5 },     // 45
        { x: 1, y: 54 },       // 46
        { x: 1, y: 60.5 },     // 47 - Safe
        { x: 1, y: 67 },       // 48
        { x: 1, y: 73.5 },     // 49
        { x: 1, y: 80 },       // 50
        { x: 1, y: 86.5 },     // 51
        { x: 7.5, y: 86.5 },   // 52 (back to start)
    ];

    // Home stretch positions (6 positions to the center "Home")
    const homeStretchPositions = {
        0: [ // Red - going right
            { x: 66, y: 86.5 },   // 53 (1st home stretch)
            { x: 72.5, y: 86.5 }, // 54
            { x: 79, y: 86.5 },   // 55
            { x: 85.5, y: 86.5 }, // 56
            { x: 85.5, y: 80 },   // 57
            { x: 85.5, y: 73.5 }, // 58 (home)
        ],
        1: [ // Green - going up
            { x: 85.5, y: 21.5 }, // 53
            { x: 85.5, y: 15 },   // 54
            { x: 85.5, y: 8.5 },  // 55
            { x: 85.5, y: 2 },    // 56
            { x: 79, y: 2 },      // 57
            { x: 72.5, y: 2 },    // 58 (home)
        ],
        2: [ // Yellow - going left
            { x: 20.5, y: 2 },   // 53
            { x: 14, y: 2 },    // 54
            { x: 7.5, y: 2 },    // 55
            { x: 1, y: 2 },      // 56
            { x: 1, y: 8.5 },    // 57
            { x: 1, y: 15 },     // 58 (home)
        ],
        3: [ // Blue - going down
            { x: 1, y: 60.5 },   // 53
            { x: 1, y: 67 },     // 54
            { x: 1, y: 73.5 },   // 55
            { x: 1, y: 80 },    // 56
            { x: 1, y: 86.5 },   // 57
            { x: 7.5, y: 86.5 }, // 58 (home)
        ],
    };

    // Home positions (starting positions for each player)
    const homePositions = {
        0: [ // Red - Bottom-left
            { x: 14, y: 80 },    // Top-left
            { x: 27, y: 80 },    // Top-right
            { x: 14, y: 93 },    // Bottom-left
            { x: 27, y: 93 },    // Bottom-right
        ],
        1: [ // Green - Top-left
            { x: 14, y: 7 },     // Top-left
            { x: 27, y: 7 },     // Top-right
            { x: 14, y: 20 },    // Bottom-left
            { x: 27, y: 20 },   // Bottom-right
        ],
        2: [ // Yellow - Top-right
            { x: 73, y: 7 },     // Top-left
            { x: 86, y: 7 },     // Top-right
            { x: 73, y: 20 },    // Bottom-left
            { x: 86, y: 20 },   // Bottom-right
        ],
        3: [ // Blue - Bottom-right
            { x: 73, y: 80 },    // Top-left
            { x: 86, y: 80 },   // Top-right
            { x: 73, y: 93 },    // Bottom-left
            { x: 86, y: 93 },    // Bottom-right
        ],
    };

    // Initialize game state
    const initializeGame = () => {
        const state = {};
        for (let i = 0; i < playerCount; i++) {
            state[i] = {
                pieces: [
                    { id: 0, position: 'home', homeIndex: 0 },
                    { id: 1, position: 'home', homeIndex: 1 },
                    { id: 2, position: 'home', homeIndex: 2 },
                    { id: 3, position: 'home', homeIndex: 3 },
                ],
                finishedPieces: 0,
            };
        }
        setGameState(state);
        setCurrentPlayer(0);
        setWinner(null);
        setCanRollAgain(false);
        setGameMessage(`${playerNames[0]}'s turn. Roll the dice!`);
        setAvailableMoves([]);
        setWaitingForPieceSelection(false);
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

    // Get valid moves for current player
    const getValidMoves = (playerId, diceValue) => {
        const player = gameState[playerId];
        const validMoves = [];

        player.pieces.forEach((piece, index) => {
            if (piece.position === 'home' && diceValue === 6) {
                // Can move piece out of home (only if start position is empty or has opponent's piece)
                const startPos = playerStartPositions[playerId];
                const isBlocked = isPositionBlockedByOwnPiece(playerId, startPos);
                
                if (!isBlocked) {
                    validMoves.push({
                        pieceIndex: index,
                        from: 'home',
                        to: startPos,
                        canMove: true,
                    });
                }
            } else if (piece.position !== 'home' && piece.position !== 'finished') {
                const newPos = calculateNewPosition(playerId, piece.position, diceValue);
                if (newPos !== null) {
                    const isBlocked = isPositionBlockedByOwnPiece(playerId, newPos);
                    if (!isBlocked) {
                        validMoves.push({
                            pieceIndex: index,
                            from: piece.position,
                            to: newPos,
                            canMove: true,
                        });
                    }
                }
            }
        });

        return validMoves;
    };

    // Check if position is blocked by own piece
    const isPositionBlockedByOwnPiece = (playerId, position) => {
        if (position === 'home' || position === 'finished') return false;
        
        const player = gameState[playerId];
        for (const piece of player.pieces) {
            if (piece.position === position) {
                return true;
            }
        }
        return false;
    };

    // Calculate new position after dice roll
    const calculateNewPosition = (playerId, currentPos, diceValue) => {
        if (currentPos === 'home' || currentPos === 'finished') return null;

        // If in home stretch
        if (currentPos >= 53) {
            const newPos = currentPos + diceValue;
            if (newPos > 58) return null; // Can't move past home
            return newPos;
        }

        // Regular board movement
        let newPos = currentPos + diceValue;

        // Check if entering home stretch
        const homeEntry = (playerStartPositions[playerId] + 51) % 52;
        if (currentPos <= homeEntry && newPos > homeEntry) {
            const homeStretchPos = 53 + (newPos - homeEntry - 1);
            if (homeStretchPos > 58) return null;
            return homeStretchPos;
        }

        // Wrap around the board
        if (newPos >= 53) {
            newPos = newPos % 52;
        }

        return newPos;
    };

    // Check if a piece can capture another
    const checkCapture = (playerId, newPosition) => {
        if (safePositions.includes(newPosition) || newPosition >= 53) return null;

        for (let otherPlayerId = 0; otherPlayerId < playerCount; otherPlayerId++) {
            if (otherPlayerId === playerId) continue;
            const otherPlayer = gameState[otherPlayerId];
            for (let i = 0; i < otherPlayer.pieces.length; i++) {
                const piece = otherPlayer.pieces[i];
                if (piece.position === newPosition) {
                    return { playerId: otherPlayerId, pieceIndex: i };
                }
            }
        }
        return null;
    };

    // Roll dice
    const rollDice = () => {
        if (isRolling || waitingForPieceSelection || winner !== null) return;

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
        const validMoves = getValidMoves(currentPlayer, value);
        setAvailableMoves(validMoves);

        if (validMoves.length === 0) {
            setGameMessage(`${playerNames[currentPlayer]} has no valid moves. Next player's turn.`);
            setTimeout(() => nextPlayer(), 1500);
        } else if (validMoves.length === 1) {
            setTimeout(() => executeMove(currentPlayer, validMoves[0].pieceIndex, value), 500);
        } else {
            setWaitingForPieceSelection(true);
            setGameMessage(`${playerNames[currentPlayer]} rolled ${value}. Choose a piece to move.`);
        }
    };

    // Execute a move
    const executeMove = (playerId, pieceIndex, diceValue) => {
        const newGameState = JSON.parse(JSON.stringify(gameState));
        const piece = newGameState[playerId].pieces[pieceIndex];
        let newPosition;

        if (piece.position === 'home' && diceValue === 6) {
            newPosition = playerStartPositions[playerId];
            piece.position = newPosition;
            piece.homeIndex = -1;
            setGameMessage(`${playerNames[playerId]} brought a piece into play!`);
        } else if (piece.position !== 'home' && piece.position !== 'finished') {
            newPosition = calculateNewPosition(playerId, piece.position, diceValue);
            if (newPosition === null) {
                setGameMessage(`${playerNames[playerId]} can't move this piece.`);
                setWaitingForPieceSelection(false);
                setAvailableMoves([]);
                return;
            }

            // Check for capture
            const capturedPiece = checkCapture(playerId, newPosition);
            if (capturedPiece) {
                const capturedPlayer = newGameState[capturedPiece.playerId];
                const capturedPieceData = capturedPlayer.pieces[capturedPiece.pieceIndex];
                capturedPieceData.position = 'home';
                capturedPieceData.homeIndex = capturedPiece.pieceIndex;
                setGameMessage(`${playerNames[playerId]} captured ${playerNames[capturedPiece.playerId]}'s piece!`);
                setCanRollAgain(true);
            }

            if (newPosition === 58) {
                piece.position = 'finished';
                newGameState[playerId].finishedPieces++;
                setGameMessage(`${playerNames[playerId]} got a piece home!`);

                if (newGameState[playerId].finishedPieces === 4) {
                    setWinner(playerId);
                    setGameMessage(`🎉 ${playerNames[playerId]} wins the game!`);
                    setWaitingForPieceSelection(false);
                    setAvailableMoves([]);
                    setGameState(newGameState);
                    return;
                }
            } else {
                piece.position = newPosition;
            }
        }

        setGameState(newGameState);
        setWaitingForPieceSelection(false);
        setAvailableMoves([]);

        if ((diceValue === 6 || canRollAgain) && winner === null) {
            setCanRollAgain(false);
            setGameMessage(`${playerNames[currentPlayer]} rolled ${diceValue}. Roll again!`);
        } else {
            setTimeout(() => nextPlayer(), 1500);
        }
    };

    // Move to next player
    const nextPlayer = () => {
        if (winner !== null) return;
        const nextPlayerIndex = (currentPlayer + 1) % playerCount;
        setCurrentPlayer(nextPlayerIndex);
        setGameMessage(`${playerNames[nextPlayerIndex]}'s turn. Roll the dice!`);
        setCanRollAgain(false);
    };

    // Handle piece click
    const handlePieceClick = (playerId, pieceIndex) => {
        if (playerId !== currentPlayer || !waitingForPieceSelection) return;
        const validMove = availableMoves.find((move) => move.pieceIndex === pieceIndex);
        if (validMove) {
            executeMove(playerId, pieceIndex, diceValue);
        }
    };

    // Get piece position coordinates
    const getPiecePosition = (piece, playerId, pieceIndex) => {
        if (piece.position === 'home') {
            return homePositions[playerId][piece.homeIndex];
        } else if (piece.position === 'finished') {
            // Position finished pieces in the center of the board
            const finishedIndex = gameState[playerId].pieces.filter((p) => p.position === 'finished').indexOf(piece);
            return {
                x: 46.5 + (finishedIndex % 2) * 7,
                y: 46.5 + Math.floor(finishedIndex / 2) * 7,
            };
        } else if (piece.position < 53) {
            return boardPositions[piece.position];
        } else {
            const homeStretchIndex = piece.position - 53;
            return homeStretchPositions[playerId][homeStretchIndex];
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
        return (
            <div className="w-[600px] h-[600px] relative mx-auto bg-white border-4 border-gray-800 rounded-lg overflow-hidden">
                {/* Board background */}
                <div className="absolute inset-0 bg-[url('/ludo-board.png')] bg-cover bg-center" />

                {/* Render all pieces */}
                {Object.entries(gameState).map(([playerId, player]) =>
                    player.pieces.map((piece, pieceIndex) => {
                        const position = getPiecePosition(piece, parseInt(playerId), pieceIndex);
                        if (!position) return null;

                        const isValidMove = availableMoves.some((move) => move.pieceIndex === pieceIndex);
                        const isCurrentPlayerPiece = parseInt(playerId) === currentPlayer;

                        return (
                            <div
                                key={`${playerId}-${pieceIndex}`}
                                className={`absolute w-6 h-6 rounded-full border-2 border-white cursor-pointer transition-all duration-200 ${
                                    isValidMove && waitingForPieceSelection ? 'animate-pulse scale-110 ring-4 ring-yellow-400' : ''
                                } ${isCurrentPlayerPiece ? 'hover:scale-110' : ''}`}
                                style={{
                                    left: `${position.x}%`,
                                    top: `${position.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: playerColors[playerCount][parseInt(playerId)],
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                }}
                                onClick={() => handlePieceClick(parseInt(playerId), pieceIndex)}
                            />
                        );
                    })
                )}
            </div>
        );
    };

    if (!gameStarted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
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
                                        className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                                            playerCount === count
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
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-300"
                                            style={{ backgroundColor: playerColors[playerCount][i] }}
                                        />
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
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
            <div className="max-w-7xl mx-auto">
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
                        {/* Game Message */}
                        {gameMessage && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-blue-800 text-center font-medium">{gameMessage}</p>
                            </div>
                        )}

                        {/* Current Player */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Turn</h3>
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                                    style={{ backgroundColor: playerColors[playerCount][currentPlayer] }}
                                />
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
                                    disabled={isRolling || waitingForPieceSelection || winner !== null}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                                >
                                    {isRolling ? 'Rolling...' : waitingForPieceSelection ? 'Choose Piece' : 'Roll Dice'}
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
                                            <div
                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                style={{ backgroundColor: playerColors[playerCount][i] }}
                                            />
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
                                    <div
                                        className="w-6 h-6 rounded-full border-2 border-green-600"
                                        style={{ backgroundColor: playerColors[playerCount][winner] }}
                                    />
                                    <span className="text-green-800 font-medium">{playerNames[winner]} wins!</span>
                                </div>
                            </div>
                        )}

                        {/* Rules */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Rules</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Roll 6 to move pieces out of home</li>
                                <li>• Roll 6 or capture to get another turn</li>
                                <li>• Capture opponents to send them home</li>
                                <li>• Safe squares (stars) protect from capture</li>
                                <li>• First to get all 4 pieces home wins!</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LudoGame;