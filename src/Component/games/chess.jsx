import React, { useState, useCallback } from 'react';

const Chess = () => {
    // Initial board setup
    const initialBoard = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];

    const [board, setBoard] = useState(initialBoard);
    const [currentPlayer, setCurrentPlayer] = useState('white');
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [gameStatus, setGameStatus] = useState('active');
    const [moveHistory, setMoveHistory] = useState([]);

    // Piece symbols
    const pieceSymbols = {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };

    const isWhitePiece = (piece) => piece && piece === piece.toUpperCase();
    const isBlackPiece = (piece) => piece && piece === piece.toLowerCase();

    const isValidMove = (fromRow, fromCol, toRow, toCol, piece) => {
        if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;

        const targetPiece = board[toRow][toCol];
        if (targetPiece &&
            ((isWhitePiece(piece) && isWhitePiece(targetPiece)) ||
                (isBlackPiece(piece) && isBlackPiece(targetPiece)))) {
            return false;
        }

        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        const rowDir = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
        const colDir = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

        switch (piece.toLowerCase()) {
            case 'p':
                const direction = isWhitePiece(piece) ? -1 : 1;
                const startRow = isWhitePiece(piece) ? 6 : 1;

                if (fromCol === toCol && !targetPiece) {
                    if (toRow === fromRow + direction) return true;
                    if (fromRow === startRow && toRow === fromRow + 2 * direction) return true;
                }
                if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && targetPiece) {
                    return true;
                }
                return false;

            case 'r':
                if (rowDiff === 0 || colDiff === 0) {
                    for (let i = 1; i < Math.max(rowDiff, colDiff); i++) {
                        if (board[fromRow + i * rowDir][fromCol + i * colDir]) return false;
                    }
                    return true;
                }
                return false;

            case 'n':
                return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

            case 'b':
                if (rowDiff === colDiff) {
                    for (let i = 1; i < rowDiff; i++) {
                        if (board[fromRow + i * rowDir][fromCol + i * colDir]) return false;
                    }
                    return true;
                }
                return false;

            case 'q':
                if (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) {
                    for (let i = 1; i < Math.max(rowDiff, colDiff); i++) {
                        if (board[fromRow + i * rowDir][fromCol + i * colDir]) return false;
                    }
                    return true;
                }
                return false;

            case 'k':
                return rowDiff <= 1 && colDiff <= 1;

            default:
                return false;
        }
    };

    const getValidMoves = (row, col) => {
        const piece = board[row][col];
        if (!piece) return [];

        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (isValidMove(row, col, r, c, piece)) {
                    moves.push([r, c]);
                }
            }
        }
        return moves;
    };

    const handleSquareClick = (row, col) => {
        if (gameStatus !== 'active') return;

        if (selectedSquare) {
            const [selectedRow, selectedCol] = selectedSquare;
            const piece = board[selectedRow][selectedCol];

            if (row === selectedRow && col === selectedCol) {
                setSelectedSquare(null);
                setValidMoves([]);
                return;
            }

            if (validMoves.some(([r, c]) => r === row && c === col)) {
                const newBoard = board.map(row => [...row]);
                const capturedPiece = newBoard[row][col];
                newBoard[row][col] = piece;
                newBoard[selectedRow][selectedCol] = null;

                setBoard(newBoard);
                setMoveHistory(prev => [...prev, {
                    from: [selectedRow, selectedCol],
                    to: [row, col],
                    piece,
                    captured: capturedPiece,
                    player: currentPlayer
                }]);
                setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
                setSelectedSquare(null);
                setValidMoves([]);

                // Check for checkmate (simplified)
                if (capturedPiece && capturedPiece.toLowerCase() === 'k') {
                    setGameStatus(`${currentPlayer} wins!`);
                }
            } else {
                const clickedPiece = board[row][col];
                if (clickedPiece &&
                    ((currentPlayer === 'white' && isWhitePiece(clickedPiece)) ||
                        (currentPlayer === 'black' && isBlackPiece(clickedPiece)))) {
                    setSelectedSquare([row, col]);
                    setValidMoves(getValidMoves(row, col));
                } else {
                    setSelectedSquare(null);
                    setValidMoves([]);
                }
            }
        } else {
            const piece = board[row][col];
            if (piece &&
                ((currentPlayer === 'white' && isWhitePiece(piece)) ||
                    (currentPlayer === 'black' && isBlackPiece(piece)))) {
                setSelectedSquare([row, col]);
                setValidMoves(getValidMoves(row, col));
            }
        }
    };

    const resetGame = () => {
        setBoard(initialBoard);
        setCurrentPlayer('white');
        setSelectedSquare(null);
        setValidMoves([]);
        setGameStatus('active');
        setMoveHistory([]);
    };

    const isSelected = (row, col) => {
        return selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col;
    };

    const isValidMoveSquare = (row, col) => {
        return validMoves.some(([r, c]) => r === row && c === col);
    };

    return (
        <div className="min-h-screen bg-stone-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-bold text-stone-800 mb-2">Chess</h1>
                    <div className="flex items-center justify-center gap-4 text-lg">
                        <div className={`px-4 py-2 rounded-lg border-2 ${currentPlayer === 'white'
                                ? 'bg-white border-stone-400 text-stone-800'
                                : 'bg-stone-200 border-stone-300 text-stone-600'
                            }`}>
                            White Player {currentPlayer === 'white' && '(Current)'}
                        </div>
                        <div className={`px-4 py-2 rounded-lg border-2 ${currentPlayer === 'black'
                                ? 'bg-stone-800 border-stone-600 text-white'
                                : 'bg-stone-300 border-stone-400 text-stone-600'
                            }`}>
                            Black Player {currentPlayer === 'black' && '(Current)'}
                        </div>
                    </div>
                    {gameStatus !== 'active' && (
                        <div className="mt-4 text-2xl font-bold text-green-700">
                            {gameStatus}
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-lg border border-stone-200">
                        <div className="grid grid-cols-8 gap-0 border-2 border-stone-800">
                            {board.map((row, rowIndex) =>
                                row.map((piece, colIndex) => (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        className={`
                      w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl cursor-pointer
                      transition-all duration-200 border border-stone-300
                      ${(rowIndex + colIndex) % 2 === 0 ? 'bg-stone-100' : 'bg-stone-300'}
                      ${isSelected(rowIndex, colIndex) ? 'ring-4 ring-blue-400' : ''}
                      ${isValidMoveSquare(rowIndex, colIndex) ? 'ring-2 ring-green-400' : ''}
                      hover:brightness-110
                    `}
                                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                                    >
                                        {piece && (
                                            <span className={`
                        select-none
                        ${isWhitePiece(piece) ? 'text-white drop-shadow-lg' : 'text-black'}
                      `}>
                                                {pieceSymbols[piece]}
                                            </span>
                                        )}
                                        {isValidMoveSquare(rowIndex, colIndex) && !piece && (
                                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-lg border border-stone-200 w-full lg:w-80">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-stone-800">Game Info</h3>
                            <button
                                onClick={resetGame}
                                className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
                            >
                                New Game
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="text-sm text-stone-600">
                                <strong>Current Turn:</strong> {currentPlayer === 'white' ? 'White' : 'Black'}
                            </div>

                            <div className="text-sm text-stone-600">
                                <strong>Moves:</strong> {moveHistory.length}
                            </div>

                            {moveHistory.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-stone-800 mb-2">Recent Moves</h4>
                                    <div className="max-h-40 overflow-y-auto text-sm space-y-1">
                                        {moveHistory.slice(-10).reverse().map((move, index) => (
                                            <div key={index} className="text-stone-600">
                                                {move.player === 'white' ? '♔' : '♚'} {pieceSymbols[move.piece]}
                                                {String.fromCharCode(97 + move.from[1])}{8 - move.from[0]} →
                                                {String.fromCharCode(97 + move.to[1])}{8 - move.to[0]}
                                                {move.captured && ` (captured ${pieceSymbols[move.captured]})`}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 text-xs text-stone-500 space-y-1">
                            <div><strong>How to play:</strong></div>
                            <div>• Click a piece to select it</div>
                            <div>• Green highlights show valid moves</div>
                            <div>• Click a highlighted square to move</div>
                            <div>• Capture the opponent's king to win</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chess;