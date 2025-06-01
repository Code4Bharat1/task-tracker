import React, { useState, useEffect, useRef } from 'react';
import { Clock, RotateCcw, Trophy, Zap } from 'lucide-react';

export default function TypingSpeedTest() {
    const [selectedTime, setSelectedTime] = useState(60);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isActive, setIsActive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [correctChars, setCorrectChars] = useState(0);
    const [totalChars, setTotalChars] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [errors, setErrors] = useState([]);

    const inputRef = useRef(null);
    const intervalRef = useRef(null);

    const timeOptions = [15, 30, 60, 120, 300];

    const sampleText = "The quick brown fox jumps over the lazy dog near the riverbank where children often play during summer afternoons while their parents sit on wooden benches reading newspapers and watching clouds drift slowly across the bright blue sky filled with possibilities and dreams that seem within reach when the world feels peaceful and calm like this moment in time when everything seems perfect and nothing else matters except the gentle breeze that carries the scent of blooming flowers from nearby gardens where butterflies dance among colorful petals creating a symphony of natural beauty that reminds us why life is worth living and cherishing every single day we are blessed to experience on this amazing planet we call home".split(' ');

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(time => {
                    if (time <= 1) {
                        setIsActive(false);
                        setIsCompleted(true);
                        return 0;
                    }
                    return time - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isActive, timeLeft]);

    useEffect(() => {
        if (totalChars > 0) {
            const timeElapsed = selectedTime - timeLeft;
            const minutes = timeElapsed / 60;
            const wordsTyped = correctChars / 5;
            setWpm(minutes > 0 ? Math.round(wordsTyped / minutes) : 0);
            setAccuracy(Math.round((correctChars / totalChars) * 100));
        }
    }, [correctChars, totalChars, timeLeft, selectedTime]);

    const startTest = () => {
        setIsActive(true);
        setIsCompleted(false);
        setUserInput('');
        setCurrentWordIndex(0);
        setCurrentCharIndex(0);
        setCorrectChars(0);
        setTotalChars(0);
        setErrors([]);
        setTimeLeft(selectedTime);
        inputRef.current?.focus();
    };

    const resetTest = () => {
        setIsActive(false);
        setIsCompleted(false);
        setUserInput('');
        setCurrentWordIndex(0);
        setCurrentCharIndex(0);
        setCorrectChars(0);
        setTotalChars(0);
        setWpm(0);
        setAccuracy(100);
        setErrors([]);
        setTimeLeft(selectedTime);
    };

    const handleInputChange = (e) => {
        if (!isActive || isCompleted) return;

        const value = e.target.value;
        setUserInput(value);

        const words = value.split(' ');
        const currentWord = words[words.length - 1];

        let correct = 0;
        let total = value.length;
        setTotalChars(total);

        const fullText = sampleText.slice(0, words.length).join(' ');
        for (let i = 0; i < Math.min(value.length, fullText.length); i++) {
            if (value[i] === fullText[i]) {
                correct++;
            }
        }

        setCorrectChars(correct);

        if (value.endsWith(' ') && words.length <= sampleText.length) {
            const completedWord = words[words.length - 2];
            if (completedWord !== sampleText[words.length - 2]) {
                setErrors(prev => [...prev, words.length - 2]);
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getCharacterClass = (wordIndex, charIndex, char) => {
        const userWords = userInput.split(' ');
        const currentUserWord = userWords[wordIndex] || '';

        if (wordIndex < userWords.length - 1 || (wordIndex === userWords.length - 1 && userInput.endsWith(' '))) {
            if (charIndex < currentUserWord.length) {
                return currentUserWord[charIndex] === char ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800';
            }
            return 'text-gray-400';
        } else if (wordIndex === userWords.length - 1) {
            if (charIndex < currentUserWord.length) {
                return currentUserWord[charIndex] === char ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800';
            } else if (charIndex === currentUserWord.length) {
                return 'bg-blue-200 animate-pulse';
            }
            return 'text-gray-600';
        }

        return 'text-gray-600';
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                    <Zap className="text-blue-500" />
                    Typing Speed Test
                </h1>
                <p className="text-gray-600">Test your typing speed and accuracy</p>
            </div>

            {!isActive && !isCompleted && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Select Test Duration</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {timeOptions.map((time) => (
                            <button
                                key={time}
                                onClick={() => {
                                    setSelectedTime(time);
                                    setTimeLeft(time);
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${selectedTime === time
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {time < 60 ? `${time}s` : `${time / 60}m`}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{formatTime(timeLeft)}</div>
                    <div className="text-sm text-gray-600">Time Left</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                    <Zap className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{wpm}</div>
                    <div className="text-sm text-gray-600">WPM</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="w-6 h-6 bg-orange-500 rounded mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold">
                        {errors.length}
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{errors.length}</div>
                    <div className="text-sm text-gray-600">Errors</div>
                </div>
            </div>

            {/* Improved text display with proper wrapping */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6 border-2 border-gray-200 max-h-48 overflow-y-auto">
                <div className="text-lg font-mono leading-relaxed break-words">
                    {sampleText.slice(0, 50).map((word, wordIndex) => (
                        <span
                            key={wordIndex}
                            className={`inline-block mr-2 mb-1 ${errors.includes(wordIndex) ? 'border-b-2 border-red-400' : ''}`}
                        >
                            {word.split('').map((char, charIndex) => (
                                <span
                                    key={charIndex}
                                    className={`${getCharacterClass(wordIndex, charIndex, char)} px-0.5 rounded`}
                                >
                                    {char}
                                </span>
                            ))}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={handleInputChange}
                    disabled={!isActive || isCompleted}
                    placeholder={isActive ? "Start typing..." : "Click Start Test to begin"}
                    className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg resize-none text-lg font-mono focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                />
            </div>

            <div className="flex justify-center gap-4">
                {!isActive && !isCompleted && (
                    <button
                        onClick={startTest}
                        className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                    >
                        <Zap className="w-5 h-5" />
                        Start Test
                    </button>
                )}

                {(isActive || isCompleted) && (
                    <button
                        onClick={resetTest}
                        className="px-8 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Reset Test
                    </button>
                )}
            </div>

            {isCompleted && (
                <div className="mt-8 bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center flex items-center justify-center gap-2">
                        <Trophy className="text-yellow-500" />
                        Test Complete!
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-3xl font-bold text-blue-600">{wpm}</div>
                            <div className="text-gray-600">Words per Minute</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-600">{accuracy}%</div>
                            <div className="text-gray-600">Accuracy</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-purple-600">{correctChars}</div>
                            <div className="text-gray-600">Correct Characters</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}