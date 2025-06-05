'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Palette, RotateCcw, Send, Users, Clock, Trophy, Pencil } from 'lucide-react';

const DrawizeGame = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(3);
    const [currentWord, setCurrentWord] = useState('');
    const [guess, setGuess] = useState('');
    const [gameState, setGameState] = useState('waiting'); // waiting, drawing, guessing
    const [players] = useState([
        { id: 1, name: 'You', score: 0, isDrawing: true },
        { id: 2, name: 'Alice', score: 150, isDrawing: false },
        { id: 3, name: 'Bob', score: 120, isDrawing: false },
        { id: 4, name: 'Charlie', score: 90, isDrawing: false }
    ]);
    const [timeLeft, setTimeLeft] = useState(60);
    const [chatMessages, setChatMessages] = useState([
        { id: 1, player: 'Alice', message: 'Good luck everyone!', type: 'chat' },
        { id: 2, player: 'Bob', message: 'Is it an animal?', type: 'guess' }
    ]);
    const [words] = useState(['elephant', 'pizza', 'rainbow', 'bicycle', 'guitar', 'butterfly', 'castle', 'rocket']);

    const colors = [
        '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
        '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Set canvas size - fixed dimensions
        const canvasWidth = 600;
        const canvasHeight = 400;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Set initial background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }, []);

    useEffect(() => {
        if (gameState === 'drawing' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, gameState]);

    const getCanvasCoords = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsDrawing(true);
        const coords = getCanvasCoords(e);

        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const coords = getCanvasCoords(e);
        const ctx = canvas.getContext('2d');

        ctx.lineWidth = brushSize;
        ctx.strokeStyle = currentColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const startGame = () => {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        setCurrentWord(randomWord);
        setGameState('drawing');
        setTimeLeft(60);
    };

    const submitGuess = () => {
        if (guess.trim()) {
            const newMessage = {
                id: chatMessages.length + 1,
                player: 'You',
                message: guess,
                type: guess.toLowerCase() === currentWord.toLowerCase() ? 'correct' : 'guess'
            };
            setChatMessages([...chatMessages, newMessage]);
            setGuess('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            submitGuess();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-500 p-3 rounded-xl">
                                <Pencil className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Drawize</h1>
                                <p className="text-gray-600">Draw and Guess Game</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6 text-gray-700">
                            <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                                <Clock className="h-5 w-5 text-red-600" />
                                <span className="font-bold text-xl text-red-600">{timeLeft}s</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                                <Users className="h-5 w-5 text-blue-600" />
                                <span className="text-blue-600 font-medium">{players.length} Players</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Players Panel */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                            Players
                        </h3>
                        <div className="space-y-3">
                            {players.map((player) => (
                                <div key={player.id} className={`flex items-center justify-between p-3 rounded-xl border ${player.isDrawing
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${player.isDrawing ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}></div>
                                        <span className="text-gray-800 font-medium">{player.name}</span>
                                        {player.isDrawing && <Pencil className="h-4 w-4 text-yellow-600" />}
                                    </div>
                                    <span className="text-gray-600 font-bold">{player.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Drawing Canvas */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        {gameState === 'waiting' ? (
                            <div className="flex flex-col items-center justify-center h-96 text-center">
                                <div className="bg-blue-100 p-6 rounded-full mb-4">
                                    <Palette className="h-16 w-16 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Draw?</h3>
                                <p className="text-gray-600 mb-6">Click start to begin the game!</p>
                                <button
                                    onClick={startGame}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Start Game
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Word Display */}
                                <div className="mb-4 text-center">
                                    <div className="inline-block bg-blue-50 px-6 py-2 rounded-xl border border-blue-200">
                                        <span className="text-2xl font-bold text-blue-800 tracking-wider">
                                            {currentWord.split('').map((char, i) => (
                                                <span key={i} className="inline-block border-b-2 border-blue-400 mx-1 pb-1 min-w-[20px] text-center">
                                                    {players[0].isDrawing ? char : '_'}
                                                </span>
                                            ))}
                                        </span>
                                    </div>
                                </div>

                                {/* Drawing Tools - Fixed Layout */}
                                <div className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-200">
                                    {/* Color palette row */}
                                    <div className="flex justify-center mb-3">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setCurrentColor(color)}
                                                    className={`w-8 h-8 rounded-lg border-2 transition-all shadow-sm ${currentColor === color ? 'border-gray-800 scale-110 shadow-md' : 'border-gray-300'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Controls row */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2 text-gray-700">
                                            <span className="text-sm font-medium">Size:</span>
                                            <input
                                                type="range"
                                                min="1"
                                                max="20"
                                                value={brushSize}
                                                onChange={(e) => setBrushSize(e.target.value)}
                                                className="w-16 accent-blue-600"
                                            />
                                            <span className="text-sm font-medium min-w-[24px] text-center">{brushSize}</span>
                                        </div>
                                        <button
                                            onClick={clearCanvas}
                                            className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition-colors border border-red-200"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            <span className="font-medium">Clear</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Canvas */}
                                <div className="bg-white rounded-xl p-2 shadow-inner border border-gray-200">
                                    <canvas
                                        ref={canvasRef}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        className="border border-gray-300 rounded-lg cursor-crosshair w-full h-auto block shadow-sm"
                                        width={600}
                                        height={400}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Chat Panel - Fixed Input Layout */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Chat & Guesses</h3>

                        {/* Messages */}
                        <div className="h-64 overflow-y-auto mb-4 space-y-2 bg-gray-50 rounded-xl p-3 border border-gray-200">
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`p-2 rounded-lg text-sm border ${msg.type === 'correct'
                                    ? 'bg-green-50 text-green-800 border-green-200'
                                    : msg.type === 'guess'
                                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                                        : 'bg-white text-gray-700 border-gray-200'
                                    }`}>
                                    <span className="font-medium">{msg.player}:</span> {msg.message}
                                    {msg.type === 'correct' && <span className="ml-2">🎉</span>}
                                </div>
                            ))}
                        </div>

                        {/* Input - Fixed Layout */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your guess..."
                                className="flex-1 min-w-0 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                onClick={submitGuess}
                                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors shadow-sm"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrawizeGame;