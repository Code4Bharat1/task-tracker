import React, { useState, useEffect } from 'react';
import { Users, Bot, RotateCcw, Play, Trophy, X, Circle } from 'lucide-react';

const TicTacToeGame = () => {
    const [gameMode, setGameMode] = useState('pvp');
    const [gameStarted, setGameStarted] = useState(false);
    const [board, setBoard] = useState(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState('X');
    const [winner, setWinner] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
    const [isComputerThinking, setIsComputerThinking] = useState(false);
    const [winningLine, setWinningLine] = useState([]);
    const [difficulty, setDifficulty] = useState('medium');
    const [tournamentRound, setTournamentRound] = useState(1);
    const [bestOfGames, setBestOfGames] = useState(3);

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const checkWinner = (boardState) => {
        for (let combination of winningCombinations) {
            const [a, b, c] = combination;
            if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
                return { winner: boardState[a], line: combination };
            }
        }
        return null;
    };

    const checkDraw = (boardState) => {
        return boardState.every(cell => cell !== null);
    };

    const getComputerMove = (boardState) => {
        const availableMoves = boardState.map((cell, index) => cell === null ? index : null).filter(val => val !== null);

        if (difficulty === 'easy') {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        if (difficulty === 'medium') {
            if (Math.random() < 0.7) {
                return getBestMove(boardState);
            } else {
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
        }

        return getBestMove(boardState);
    };

    const getBestMove = (boardState) => {
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < 9; i++) {
            if (boardState[i] === null) {
                boardState[i] = 'O';
                let score = minimax(boardState, 0, false);
                boardState[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    };

    const minimax = (boardState, depth, isMaximizing) => {
        const result = checkWinner(boardState);
        if (result) {
            return result.winner === 'O' ? 10 - depth : depth - 10;
        }
        if (checkDraw(boardState)) {
            return 0;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (boardState[i] === null) {
                    boardState[i] = 'O';
                    let score = minimax(boardState, depth + 1, false);
                    boardState[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (boardState[i] === null) {
                    boardState[i] = 'X';
                    let score = minimax(boardState, depth + 1, true);
                    boardState[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const makeMove = (index) => {
        if (board[index] || gameOver || isComputerThinking) return;

        const newBoard = [...board];
        newBoard[index] = currentPlayer;
        setBoard(newBoard);

        const winResult = checkWinner(newBoard);
        if (winResult) {
            setWinner(winResult.winner);
            setWinningLine(winResult.line);
            setGameOver(true);
            setScores(prev => ({
                ...prev,
                [winResult.winner]: prev[winResult.winner] + 2
            }));
        } else if (checkDraw(newBoard)) {
            setIsDraw(true);
            setGameOver(true);
            setScores(prev => ({
                ...prev,
                X: prev.X + 1,
                O: prev.O + 1,
                draws: prev.draws + 1
            }));
        } else {
            setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        }
    };

    useEffect(() => {
        if (gameMode === 'pvc' && currentPlayer === 'O' && !gameOver && gameStarted) {
            setIsComputerThinking(true);
            const timer = setTimeout(() => {
                const computerMove = getComputerMove([...board]);
                makeMove(computerMove);
                setIsComputerThinking(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentPlayer, gameMode, board, gameOver, gameStarted]);

    const startNewGame = () => {
        setBoard(Array(9).fill(null));
        setCurrentPlayer('X');
        setWinner(null);
        setIsDraw(false);
        setGameOver(false);
        setWinningLine([]);
        setIsComputerThinking(false);
    };

    const startGame = () => {
        setGameStarted(true);
        startNewGame();
        setScores({ X: 0, O: 0, draws: 0 });
        setTournamentRound(1);
    };

    const resetGame = () => {
        setGameStarted(false);
        startNewGame();
        setScores({ X: 0, O: 0, draws: 0 });
        setTournamentRound(1);
    };

    const nextGame = () => {
        if (gameMode === 'tournament') {
            const maxScore = Math.max(scores.X, scores.O);
            const gamesNeeded = Math.ceil(bestOfGames / 2);

            if (maxScore >= gamesNeeded) return;
            setTournamentRound(prev => prev + 1);
        }
        startNewGame();
    };

    const getTournamentWinner = () => {
        if (scores.X > scores.O) return 'X';
        if (scores.O > scores.X) return 'O';
        return null;
    };

    const isTournamentOver = () => {
        if (gameMode !== 'tournament') return false;
        const maxScore = Math.max(scores.X, scores.O);
        const gamesNeeded = Math.ceil(bestOfGames / 2);
        return maxScore >= gamesNeeded;
    };

    const Cell = ({ index, value }) => {
        const isWinningCell = winningLine.includes(index);

        return (
            <button
                onClick={() => makeMove(index)}
                disabled={value !== null || gameOver || isComputerThinking}
                className={`
                    w-20 h-20 md:w-24 md:h-24 
                    flex items-center justify-center 
                    text-3xl md:text-4xl font-bold 
                    transition-all duration-200
                    ${index % 3 !== 2 ? 'border-r-2 border-gray-300' : ''}
                    ${index < 6 ? 'border-b-2 border-gray-300' : ''}
                    ${isWinningCell ? 'bg-green-100' : ''}
                    ${value === null && !gameOver && !isComputerThinking ? 
                        'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed'}
                `}
            >
                {value === 'X' && <X size={32} className={isWinningCell ? "text-green-600" : "text-red-500"} />}
                {value === 'O' && <Circle size={32} className={isWinningCell ? "text-green-600" : "text-blue-500"} />}
            </button>
        );
    };

    if (!gameStarted) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">Tic-Tac-Toe</h1>
                        <div className="text-6xl mb-4">⭕❌⭕</div>
                        <p className="text-gray-600">The classic XOX game</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Game Mode</label>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setGameMode('pvp')}
                                    className={`w-full p-3 rounded-lg border-2 font-medium transition-colors flex items-center justify-center space-x-2 ${
                                        gameMode === 'pvp'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    <Users size={20} />
                                    <span>Player vs Player</span>
                                </button>
                                <button
                                    onClick={() => setGameMode('pvc')}
                                    className={`w-full p-3 rounded-lg border-2 font-medium transition-colors flex items-center justify-center space-x-2 ${
                                        gameMode === 'pvc'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    <Bot size={20} />
                                    <span>Player vs Computer</span>
                                </button>
                                <button
                                    onClick={() => setGameMode('tournament')}
                                    className={`w-full p-3 rounded-lg border-2 font-medium transition-colors flex items-center justify-center space-x-2 ${
                                        gameMode === 'tournament'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    <Trophy size={20} />
                                    <span>Tournament Mode</span>
                                </button>
                            </div>
                        </div>

                        {gameMode === 'pvc' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Difficulty Level</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['easy', 'medium', 'hard'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(level)}
                                            className={`p-2 rounded-lg border-2 font-medium transition-colors capitalize ${
                                                difficulty === level
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {gameMode === 'tournament' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Best of Games</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[3, 5, 7].map((games) => (
                                        <button
                                            key={games}
                                            onClick={() => setBestOfGames(games)}
                                            className={`p-2 rounded-lg border-2 font-medium transition-colors ${
                                                bestOfGames === games
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                            }`}
                                        >
                                            Best of {games}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

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

    const tournamentWinner = getTournamentWinner();
    const tournamentOver = isTournamentOver();

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Tic-Tac-Toe</h1>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className="text-gray-600">
                                    {gameMode === 'pvp' ? 'Player vs Player' : 
                                     gameMode === 'pvc' ? 'Player vs Computer' : 
                                     'Tournament Mode'}
                                </span>
                                {gameMode === 'pvc' && <span className="text-gray-600">• {difficulty} difficulty</span>}
                                {gameMode === 'tournament' && <span className="text-gray-600">• Round {tournamentRound}</span>}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-center">
                                <div className="grid grid-cols-3 border-2 border-gray-300 rounded-lg overflow-hidden">
                                    {board.map((cell, index) => (
                                        <Cell key={index} index={index} value={cell} />
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                {isComputerThinking && (
                                    <div className="text-blue-600 font-medium">
                                        <Bot className="inline mr-2" size={20} />
                                        Computer is thinking...
                                    </div>
                                )}

                                {!gameOver && !isComputerThinking && (
                                    <div className="text-lg font-medium text-gray-800">
                                        Current Turn:
                                        <span className="ml-2 inline-flex items-center">
                                            {currentPlayer === 'X' ? (
                                                <>
                                                    <X size={24} className="text-red-500 mr-1" />
                                                    <span className="text-red-500">Player X</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Circle size={24} className="text-blue-500 mr-1" />
                                                    <span className="text-blue-500">
                                                        {gameMode === 'pvc' ? 'Computer' : 'Player O'}
                                                    </span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                )}

                                {winner && (
                                    <div className="text-2xl font-bold text-green-600 mb-4">
                                        <Trophy className="inline mr-2" size={32} />
                                        {winner === 'X' ? 'Player X' : (gameMode === 'pvc' ? 'Computer' : 'Player O')} Wins! 🎉
                                    </div>
                                )}

                                {isDraw && (
                                    <div className="text-2xl font-bold text-yellow-600 mb-4">
                                        It's a Draw! 🤝
                                    </div>
                                )}

                                {gameOver && !tournamentOver && (
                                    <button
                                        onClick={nextGame}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        {gameMode === 'tournament' ? 'Next Game' : 'Play Again'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Score</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <X size={20} className="text-red-500" />
                                        <span className="font-medium">Player X</span>
                                    </div>
                                    <span className="text-xl font-bold text-red-500">{scores.X}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Circle size={20} className="text-blue-500" />
                                        <span className="font-medium">
                                            {gameMode === 'pvc' ? 'Computer' : 'Player O'}
                                        </span>
                                    </div>
                                    <span className="text-xl font-bold text-blue-500">{scores.O}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 bg-yellow-500 rounded-full"></div>
                                        <span className="font-medium">Draws</span>
                                    </div>
                                    <span className="text-xl font-bold text-yellow-500">{scores.draws}</span>
                                </div>
                            </div>
                        </div>

                        {gameMode === 'tournament' && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tournament</h3>
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-600">
                                        Best of {bestOfGames} • Round {tournamentRound}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        First to {Math.ceil(bestOfGames / 2)} wins
                                    </div>

                                    {tournamentOver && (
                                        <div className="mt-4 p-4 bg-green-100 rounded-lg">
                                            <div className="text-center">
                                                <Trophy size={32} className="mx-auto text-green-600 mb-2" />
                                                <div className="text-lg font-bold text-green-800">
                                                    Tournament Winner!
                                                </div>
                                                <div className="text-green-700">
                                                    {tournamentWinner === 'X' ? 'Player X' : (gameMode === 'pvc' ? 'Computer' : 'Player O')}
                                                    {' '}wins the tournament!
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">How to Play</h3>
                            <div className="text-sm text-gray-600 space-y-2">
                                <p>• Players take turns placing X's and O's</p>
                                <p>• Get 3 in a row (horizontal, vertical, or diagonal) to win</p>
                                <p>• If all 9 squares are filled with no winner, it's a draw</p>
                                <p>• Winner gets 2 points, Draw gives 1 point each, Loss gets 0 points</p>
                                {gameMode === 'pvc' && <p>• You are X, Computer is O</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicTacToeGame;