import { axiosInstance } from '@/lib/axiosInstance';
import React, { useState, useEffect } from 'react';


export default function BinaryChallenge() {
    const [currentNumber, setCurrentNumber] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes = 180 seconds
    const [gameOver, setGameOver] = useState(false);
    const [difficulty, setDifficulty] = useState('easy');
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [completionTime, setCompletionTime] = useState(null);
    const [gameWon, setGameWon] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');

    const difficultyRanges = {
        easy: { min: 1, max: 15 },
        medium: { min: 16, max: 63 },
        hard: { min: 64, max: 255 }
    };

    // Submit score to backend
    const submitScoreToBackend = async () => {
    setIsSaving(true);
    setSaveStatus('Saving score...');
    try {
        const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/gamescore/submit`, {
            gameName: 'Binary Game',
            score: score,
            time: completionTime,
        });
        
        console.log('Score saved successfully:', response.data);
        setSaveStatus('Score saved successfully! 🎉');
    } catch (error) {
        console.error('Error saving score:', error);
        setSaveStatus('Failed to save score. Please try again.');
    } finally {
        setIsSaving(false);
        // Clear save status after 3 seconds
        setTimeout(() => setSaveStatus(''), 3000);
    }
};
// Submit score when game ends
useEffect(() => {
    if (gameOver && completionTime !== null && (gameWon || questionsAnswered > 0)) {
        submitScoreToBackend();
    }
}, [gameOver, completionTime, gameWon, questionsAnswered]);

useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameOver && questionsAnswered < 10) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    } else if ((timeLeft === 0 || questionsAnswered >= 10) && gameStarted) {
        if (questionsAnswered >= 10) {
            // Player completed all 10 questions
            setGameWon(true);
            setCompletionTime(180 - timeLeft); // Time taken to complete
        } else {
            // Time ran out
            setCompletionTime(180 - timeLeft); // Time taken before timeout
        }
        setGameOver(true);
        setGameStarted(false);
    }
}, [timeLeft, gameStarted, gameOver, questionsAnswered]);

const generateRandomNumber = () => {
    const range = difficultyRanges[difficulty];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};

const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    setQuestionsAnswered(0);
    setTimeLeft(180); // 3 minutes
    setCompletionTime(null);
    setSaveStatus('');
    setCurrentNumber(generateRandomNumber());
    setUserInput('');
    setFeedback('');
    setIsCorrect(null);
};

const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    setQuestionsAnswered(0);
    setTimeLeft(180);
    setCompletionTime(null);
    setSaveStatus('');
    setUserInput('');
    setFeedback('');
    setIsCorrect(null);
};

const checkAnswer = () => {
    const correctBinary = currentNumber.toString(2);
    const userBinary = userInput.trim();

    if (userBinary === correctBinary) {
        setIsCorrect(true);
        setScore(score + 1); // 1 point for each correct answer
        setFeedback(`✅ Correct! ${currentNumber} = ${correctBinary}`);
    } else {
        setIsCorrect(false);
        setFeedback(`❌ Wrong! ${currentNumber} = ${correctBinary}`);
    }

    setQuestionsAnswered(questionsAnswered + 1);

    setTimeout(() => {
        if (questionsAnswered + 1 < 10) {
            setCurrentNumber(generateRandomNumber());
            setUserInput('');
            setFeedback('');
            setIsCorrect(null);
        }
    }, 1500);
};

const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^[01]*$/.test(value)) {
        setUserInput(value);
    }
};

const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userInput && gameStarted && !gameOver && questionsAnswered < 10) {
        checkAnswer();
    }
};

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/20">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-[#018ABE] mb-2 flex items-center justify-center gap-2">
                    🔢 Binary Challenge
                </h1>
                <p className="text-black">Convert 10 decimal numbers to binary in 3 minutes!</p>
            </div>

            {!gameStarted && !gameOver && (
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <h3 className="font-bold text-blue-800 mb-2">🎯 Game Rules:</h3>
                        <ul className="text-blue-700 text-sm space-y-1">
                            <li>• Convert 10 decimal numbers to binary</li>
                            <li>• You have 3 minutes to complete all 10</li>
                            <li>• Each correct answer = 1 point</li>
                            <li>• Finish early to save time!</li>
                            <li>• Your score will be automatically saved</li>
                        </ul>
                    </div>

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
                        ▶️ Start Challenge
                    </button>
                </div>
            )}

            {gameStarted && !gameOver && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="text-black">
                            <div className="text-sm opacity-80">⏱️ Time Left</div>
                            <div className={`text-2xl font-bold ${timeLeft <= 30 ? 'text-red-400' : 'text-green-400'}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        <div className="text-black text-center">
                            <div className="text-sm opacity-80">📊 Progress</div>
                            <div className="text-2xl font-bold text-purple-500">
                                {questionsAnswered}/10
                            </div>
                        </div>

                        <div className="text-black text-right">
                            <div className="text-sm opacity-80">🏆 Score</div>
                            <div className="text-2xl font-bold text-cyan-400">{score}</div>
                        </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${(questionsAnswered / 10) * 100}%` }}
                        ></div>
                    </div>

                    <div className="text-center">
                        <div className="text-gray-600 mb-2">Convert to binary:</div>
                        <div className="text-6xl font-bold text-[#018ABE] mb-6">
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
                            disabled={questionsAnswered >= 10}
                        />

                        <button
                            onClick={checkAnswer}
                            disabled={!userInput || questionsAnswered >= 10}
                            className="w-full bg-[#018ABE] text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0170a0] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            ✓ Submit Answer
                        </button>

                        <button
                            onClick={resetGame}
                            className="w-full bg-gray-500 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            🔄 Reset
                        </button>
                    </div>

                    {feedback && (
                        <div className={`text-center p-4 rounded-xl ${isCorrect
                            ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                            : 'bg-red-500/20 text-red-600 border border-red-500/30'
                            }`}>
                            {feedback}
                        </div>
                    )}
                </div>
            )}

            {gameOver && (
                <div className="text-center space-y-6">
                    <div className="text-6xl mb-4">
                        {gameWon ? '🎉' : '⏰'}
                    </div>
                    <h2 className="text-3xl font-bold text-black mb-4">
                        {gameWon ? 'Challenge Complete!' : 'Time\'s Up!'}
                    </h2>

                    {/* Save Status */}
                    {(isSaving || saveStatus) && (
                        <div className={`p-3 rounded-xl text-sm font-medium ${isSaving
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : saveStatus.includes('successfully')
                                ? 'bg-green-50 text-green-600 border border-green-200'
                                : 'bg-red-50 text-red-600 border border-red-200'
                            }`}>
                            {isSaving && <span className="inline-block animate-spin mr-2">⏳</span>}
                            {saveStatus}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                            <div className="text-gray-600 mb-2">Final Score</div>
                            <div className="text-4xl font-bold text-cyan-500">{score}/10</div>
                            <div className="text-sm text-gray-500 mt-1">
                                {questionsAnswered}/10 questions answered
                            </div>
                        </div>

                        {completionTime && (
                            <div className={`rounded-xl p-4 border ${gameWon
                                ? 'bg-green-50 border-green-200'
                                : 'bg-orange-50 border-orange-200'
                                }`}>
                                <div className={`font-semibold ${gameWon ? 'text-green-600' : 'text-orange-600'
                                    }`}>
                                    ⚡ {gameWon ? 'Completion Time' : 'Time Played'}
                                </div>
                                <div className={`text-2xl font-bold ${gameWon ? 'text-green-700' : 'text-orange-700'
                                    }`}>
                                    {formatTime(completionTime)}
                                </div>
                                <div className={`text-sm ${gameWon ? 'text-green-600' : 'text-orange-600'
                                    }`}>
                                    {gameWon && completionTime < 120 ? 'Excellent speed!' :
                                        gameWon ? 'Good timing!' : 'Keep practicing!'}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-white/10 rounded-xl p-4">
                                <div className="text-gray-500 text-sm">📊 Difficulty</div>
                                <div className="text-black font-bold capitalize">{difficulty}</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4">
                                <div className="text-gray-500 text-sm">🎯 Accuracy</div>
                                <div className="text-blue-600 font-bold">
                                    {questionsAnswered > 0 ? Math.round((score) / questionsAnswered * 100) : 0}%
                                </div>
                            </div>
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