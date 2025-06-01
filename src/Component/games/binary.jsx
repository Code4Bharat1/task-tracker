import React, { useState, useEffect } from 'react';

export default function BinaryChallenge() {
    const [currentNumber, setCurrentNumber] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameOver, setGameOver] = useState(false);
    const [difficulty, setDifficulty] = useState('easy');

    const difficultyRanges = {
        easy: { min: 1, max: 15 },
        medium: { min: 16, max: 63 },
        hard: { min: 64, max: 255 }
    };

    useEffect(() => {
        if (gameStarted && timeLeft > 0 && !gameOver) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && gameStarted) {
            setGameOver(true);
            setGameStarted(false);
        }
    }, [timeLeft, gameStarted, gameOver]);

    const generateRandomNumber = () => {
        const range = difficultyRanges[difficulty];
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    };

    const startGame = () => {
        setGameStarted(true);
        setGameOver(false);
        setScore(0);
        setStreak(0);
        setTimeLeft(30);
        setCurrentNumber(generateRandomNumber());
        setUserInput('');
        setFeedback('');
        setIsCorrect(null);
    };

    const checkAnswer = () => {
        const correctBinary = currentNumber.toString(2);
        const userBinary = userInput.trim();

        if (userBinary === correctBinary) {
            setIsCorrect(true);
            setScore(score + 10 + streak * 2);
            setStreak(streak + 1);
            setFeedback(`✅ Correct! ${currentNumber} = ${correctBinary}`);
        } else {
            setIsCorrect(false);
            setStreak(0);
            setFeedback(`❌ Wrong! ${currentNumber} = ${correctBinary}`);
        }

        setTimeout(() => {
            setCurrentNumber(generateRandomNumber());
            setUserInput('');
            setFeedback('');
            setIsCorrect(null);
        }, 1500);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (/^[01]*$/.test(value)) {
            setUserInput(value);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && userInput && gameStarted && !gameOver) {
            checkAnswer();
        }
    };

    return (
        <div className="bg-white flex items-center justify-center p-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#018ABE] mb-2 flex items-center justify-center gap-2">
                        🔢 Binary Challenge
                    </h1>
                    <p className="text-black">Convert decimal numbers to binary!</p>
                </div>

                {!gameStarted && !gameOver && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-black mb-3 font-semibold">Choose Difficulty:</label>
                            <div className="space-y-2">
                                {Object.entries(difficultyRanges).map(([level, range]) => (
                                    <button
                                        key={level}
                                        onClick={() => setDifficulty(level)}
                                        className={`w-full p-3 rounded-xl transition-all duration-200 flex items-center justify-between ${difficulty === level
                                            ? 'bg-[#018ABE] text-white shadow-lg'
                                            : 'bg-white/10 text-black hover:bg-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {level === 'easy' && '⭐'}
                                            {level === 'medium' && '⭐⭐'}
                                            {level === 'hard' && '⭐⭐⭐'}
                                            <span className="font-semibold capitalize">{level}</span>
                                        </div>
                                        <div className="text-sm opacity-80">{range.min}-{range.max}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={startGame}
                            className="w-full bg-[#018ABE] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0170a0] transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                        >
                            ▶️ Start Game
                        </button>
                    </div>
                )}

                {gameStarted && !gameOver && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="text-black">
                                <div className="text-sm opacity-80">⏱️ Time Left</div>
                                <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-green-400'}`}>
                                    {timeLeft}s
                                </div>
                            </div>

                            <div className="text-black text-right">
                                <div className="text-sm opacity-80">🏆 Score</div>
                                <div className="text-2xl font-bold text-cyan-400">{score}</div>
                            </div>
                        </div>

                        {streak > 0 && (
                            <div className="text-center">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-sm font-semibold">
                                    🔥 {streak} streak
                                </div>
                            </div>
                        )}

                        <div className="text-center">
                            <div className="text-gray-300 mb-2">Convert to binary:</div>
                            <div className="text-6xl font-bold text-[#5ce1e6] mb-6">
                                {currentNumber}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={userInput}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter binary (e.g., 1010)"
                                className="w-full p-4 rounded-xl bg-white/10 text-black placeholder-gray-400 border border-white/20 focus:border-cyan-400 focus:outline-none text-center text-xl font-mono"
                                autoFocus
                            />

                            <button
                                onClick={checkAnswer}
                                disabled={!userInput}
                                className="w-full bg-[#018ABE] text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0170a0] transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                ✓ Submit Answer
                            </button>
                        </div>

                        {feedback && (
                            <div className={`text-center p-4 rounded-xl ${isCorrect
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}>
                                {feedback}
                            </div>
                        )}
                    </div>
                )}

                {gameOver && (
                    <div className="text-center space-y-6">
                        <div className="text-6xl mb-4">🎯</div>
                        <h2 className="text-3xl font-bold text-black mb-4">Game Over!</h2>

                        <div className="space-y-2">
                            <div className="text-gray-300">Final Score</div>
                            <div className="text-4xl font-bold text-cyan-400">{score}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-white/10 rounded-xl p-4">
                                <div className="text-gray-300 text-sm">📊 Difficulty</div>
                                <div className="text-black font-bold capitalize">{difficulty}</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4">
                                <div className="text-gray-300 text-sm">🔥 Best Streak</div>
                                <div className="text-orange-400 font-bold">{streak}</div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setGameOver(false);
                                setGameStarted(false);
                            }}
                            className="w-full bg-[#018ABE] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0170a0] transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                        >
                            🔄 Play Again
                        </button>
                    </div>
                )}

                <div className="mt-8 text-center text-gray-400 text-sm">
                    <div className="mb-2">💡 Tips:</div>
                    <div>Use powers of 2: 128, 64, 32, 16, 8, 4, 2, 1</div>
                </div>
            </div>
        </div>
    );
}