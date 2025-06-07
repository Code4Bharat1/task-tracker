import { useEffect, useRef, useState } from 'react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const textModes = {
  words: {
    name: 'Words',
    content: ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'pack', 'my', 'box', 'with', 'five', 'dozen', 'liquor', 'jugs', 'bright', 'vixens', 'jump', 'dozy', 'fowl', 'quack', 'sphinx', 'of', 'black', 'quartz', 'judge', 'my', 'vow', 'how', 'vexingly', 'daft', 'jumping', 'zebras']
  },
  sentences: {
    name: 'Sentences',
    content: [
      'The quick brown fox jumps over the lazy dog.',
      'A wizard\'s job is to vex chumps quickly in fog.',
      'Pack my box with five dozen liquor jugs.',
      'How vexingly daft jumping zebras bewitch.',
      'Bright vixens jump; dozy fowl quack.',
      'Sphinx of black quartz, judge my vow.',
      'Two driven jocks help fax my big quiz.',
      'Five quacking zephyrs jolt my wax bed.',
      'The five boxing wizards jump quickly.',
      'Jackdaws love my big sphinx of quartz.',
      'My girl wove six dozen plaid jackets before she quit.',
      'Few black taxis drive up major roads on quiet hazy nights.',
      'Several fabulous dixieland jazz groups played with quick tempo.',
      'A large fawn jumped quickly over white zinc boxes.',
      'Crazy Fredrick bought many very exquisite opal jewels.'
    ]
  },
  paragraphs: {
    name: 'Paragraphs',
    content: [
      'The art of programming requires patience, creativity, and logical thinking. Every developer knows the satisfaction of solving a complex problem with elegant code. Debugging can be frustrating, but it teaches valuable lessons about attention to detail and systematic problem-solving approaches.',
      'Technology continues to evolve at an unprecedented pace, transforming how we work, communicate, and live. From artificial intelligence to quantum computing, innovations are reshaping entire industries. The key to success in this digital age is adaptability and continuous learning.',
      'Writing clean, maintainable code is more important than writing clever code. Future developers, including yourself, will thank you for clear variable names, proper documentation, and logical structure. Code is read far more often than it is written.',
      'The best programmers are not those who write the most code, but those who solve problems efficiently with the least amount of code necessary. Understanding the problem thoroughly before coding saves countless hours of debugging and refactoring later.',
      'Open source software has revolutionized the technology industry by enabling collaboration on a global scale. Developers from different continents work together to build tools that benefit millions of users worldwide. This collaborative spirit drives innovation and knowledge sharing.'
    ]
  },
  quotes: {
    name: 'Quotes',
    content: [
      "The only way to do great work is to love what you do.",
      "Innovation distinguishes between a leader and a follower.",
      "Stay hungry, stay foolish.",
      "The future belongs to those who believe in the beauty of their dreams.",
      "It is during our darkest moments that we must focus to see the light."
    ]
  },
  programming: {
    name: 'Code',
    content: [
      "function calculateSum(arr) { return arr.reduce((sum, num) => sum + num, 0); }",
      "const users = await fetch('/api/users').then(res => res.json());",
      "if (condition && !isLoading) { setData(prevData => [...prevData, newItem]); }",
      "const [state, setState] = useState({ count: 0, isActive: false });",
      "try { const result = JSON.parse(response); } catch (error) { console.error(error); }"
    ]
  },
  numbers: {
    name: 'Numbers',
    content: ['123', '456', '789', '012', '345', '678', '901', '234', '567', '890', '1234', '5678', '9012', '3456', '7890']
  }
};

export default function EnhancedTypingTest() {
  const [selectedMode, setSelectedMode] = useState('words');
  const [timeLeft, setTimeLeft] = useState(60);
  const [userInput, setUserInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [totalCharsTyped, setTotalCharsTyped] = useState(0);
  const [score, setScore] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const intervalRef = useRef(null);
  const inputRef = useRef(null);

  // Refs for maintaining state in async operations
  const gameActiveRef = useRef(false);
  const gameCompletedRef = useRef(false);
  const scoreRef = useRef(0);
  
  // Generate continuous text based on mode
  const generateText = (mode) => {
    const modeData = textModes[mode];
    let generatedText = '';
    
    if (mode === 'quotes') {
      // Generate multiple quotes
      const shuffled = [...modeData.content].sort(() => Math.random() - 0.5);
      generatedText = shuffled.join(' ');
    } else if (mode === 'programming') {
      // Generate multiple code snippets
      const shuffled = [...modeData.content].sort(() => Math.random() - 0.5);
      generatedText = shuffled.join(' ');
    } else if (mode === 'sentences') {
      // Generate multiple sentences
      const shuffled = [...modeData.content].sort(() => Math.random() - 0.5);
      generatedText = shuffled.join(' ');
    } else if (mode === 'paragraphs') {
      // Generate multiple paragraphs
      const shuffled = [...modeData.content].sort(() => Math.random() - 0.5);
      generatedText = shuffled.join(' ');
    } else if (mode === 'words') {
      // Generate many words
      const shuffled = [...modeData.content].sort(() => Math.random() - 0.5);
      const repeatedWords = [];
      for (let i = 0; i < 200; i++) {
        repeatedWords.push(shuffled[i % shuffled.length]);
      }
      generatedText = repeatedWords.join(' ');
    } else if (mode === 'numbers') {
      // Generate many numbers
      const shuffled = [...modeData.content].sort(() => Math.random() - 0.5);
      const repeatedNumbers = [];
      for (let i = 0; i < 200; i++) {
        repeatedNumbers.push(shuffled[i % shuffled.length]);
      }
      generatedText = repeatedNumbers.join(' ');
    }
    
    return generatedText;
  };

  // Initialize text
  useEffect(() => {
    setCurrentText(generateText(selectedMode));
  }, [selectedMode]);

  // Calculate real-time stats
  const getCurrentStats = () => {
    const elapsed = 60 - timeLeft;
    const minutes = elapsed / 60;
    const correctChars = userInput.split('').filter((char, i) => char === currentText[i]).length;
    const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
    const accuracy = totalCharsTyped > 0 ? Math.round(((totalCharsTyped - errors) / totalCharsTyped) * 100) : 100;
    return { wpm, accuracy, correctChars };
  };

  const { wpm: currentWpm, accuracy: currentAccuracy } = getCurrentStats();

  // Calculate score and auto-submit when test completes
  useEffect(() => {
    if (isCompleted && score === 0 && totalCharsTyped > 0) { // Only submit if user actually typed
      const { wpm, accuracy } = getCurrentStats();
      const elapsedTime = 60 - timeLeft;
      
      // Score calculation: WPM * accuracy percentage * time factor
      // Higher score for better accuracy and consistent performance
      const baseScore = wpm * (accuracy / 100);
      const timeBonus = elapsedTime >= 60 ? 1.2 : 1; // Bonus for completing full 60 seconds
      const calculatedScore = Math.round(baseScore * timeBonus);
      
      setScore(calculatedScore);
      setFinalTime(elapsedTime);
      
      // Auto-submit score after calculation
      setTimeout(() => {
        submitScoreToBackend(calculatedScore, elapsedTime);
      }, 1000); // Small delay to ensure UI updates
    }
  }, [isCompleted, timeLeft, score, totalCharsTyped]);

  // Handle typing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCompleted) return;
      if (!isActive && e.key.length === 1) {
        setIsActive(true);
      }

      const key = e.key;

      if (key === 'Backspace') {
        e.preventDefault();
        if (userInput.length > 0) {
          setUserInput(prev => prev.slice(0, -1));
          setCurrentCharIndex(prev => Math.max(0, prev - 1));
        }
      } else if (key.length === 1 && userInput.length < currentText.length) {
        e.preventDefault();
        const newInput = userInput + key;
        setUserInput(newInput);
        setCurrentCharIndex(prev => prev + 1);
        setTotalCharsTyped(prev => prev + 1);

        // Check for errors
        if (key !== currentText[userInput.length]) {
          setErrors(prev => prev + 1);
        }

        // Update word index
        if (key === ' ') {
          setCurrentWordIndex(prev => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userInput, currentText, isActive, isCompleted]);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0 && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsCompleted(true);
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isActive, timeLeft]);

  // WPM tracking
  useEffect(() => {
    if (isActive && !isCompleted && timeLeft % 2 === 0) {
      const elapsed = 60 - timeLeft;
      if (elapsed > 0) {
        const stats = getCurrentStats();
        setWpmHistory(prev => [...prev, { time: elapsed, wpm: stats.wpm }]);
      }
    }
  }, [timeLeft, isActive, isCompleted]);

  // Submit score to backend
  const submitScoreToBackend = async (finalScore, finalTime) => {
    setIsSaving(true);
    setSaveStatus('Saving score...');

    const dataToSend = {
      gameName: 'Typing Speed Test',
      score: finalScore,
      time: finalTime,
    };

    try {
      const response = await axiosInstance.post('/gamescore/submit', dataToSend);
      setSaveStatus('Score saved successfully! 🎉');
    } catch (error) {
      const errorMessage = `Failed to save score: ${error.response?.data?.message || error.message}`;
      setSaveStatus(errorMessage);
      console.error('Error submitting score:', error);
    } finally {
      setIsSaving(false);
      // Clear save status after 3 seconds
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Update refs when state changes
  useEffect(() => {
    gameActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    gameCompletedRef.current = isCompleted;
  }, [isCompleted]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Reset test
  const resetTest = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setTimeLeft(60);
    setUserInput('');
    setIsActive(false);
    setIsCompleted(false);
    setWpmHistory([]);
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
    setErrors(0);
    setTotalCharsTyped(0);
    setScore(0);
    setFinalTime(0);
    setSaveStatus('');
    setCurrentText(generateText(selectedMode));
    inputRef.current?.focus();
  };

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const renderText = () => {
    return currentText.split('').map((char, i) => {
      let className = 'text-gray-400';

      if (i < userInput.length) {
        if (userInput[i] === char) {
          className = 'text-yellow-400';
        } else {
          className = 'text-red-400 bg-red-900/30';
        }
      } else if (i === userInput.length) {
        className = 'text-white bg-yellow-500/50 animate-pulse';
      }

      return (
        <span key={i} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light mb-4 text-yellow-400">Typing Master</h1>
          <p className="text-gray-400 mb-6">60 Second Challenge</p>

          {/* Mode Selection */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {Object.entries(textModes).map(([key, mode]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedMode(key);
                  resetTest();
                }}
                className={`px-4 py-2 rounded-lg transition ${selectedMode === key
                    ? 'bg-yellow-500 text-gray-900 font-semibold'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
              >
                {mode.name}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Stats */}
        {(isActive || isCompleted) && (
          <div className="flex justify-center gap-8 mb-6 text-2xl">
            <div className="text-center">
              <div className="text-yellow-400 font-mono">{currentWpm}</div>
              <div className="text-xs text-gray-400">wpm</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-mono">{currentAccuracy}%</div>
              <div className="text-xs text-gray-400">acc</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 font-mono">{timeLeft}</div>
              <div className="text-xs text-gray-400">time</div>
            </div>
          </div>
        )}

        {/* Typing Area */}
        <div className="relative mb-8">
          <div
            className="bg-gray-800 rounded-lg p-6 min-h-[200px] text-xl leading-relaxed font-mono focus-within:ring-2 focus-within:ring-yellow-500/50 overflow-hidden"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="relative break-words overflow-wrap-anywhere">
              <div className="whitespace-pre-wrap">
                {renderText()}
              </div>
            </div>
          </div>

          {/* Hidden input for mobile support */}
          <input
            ref={inputRef}
            className="absolute opacity-0 pointer-events-none"
            value={userInput}
            onChange={() => { }}
            autoFocus
          />
        </div>

        {/* Instructions */}
        {!isActive && !isCompleted && (
          <div className="text-center text-gray-400 mb-6">
            <p>Click here or start typing to begin the 60-second test</p>
          </div>
        )}

        {/* Reset Button */}
        <div className="text-center mb-8">
          <button
            onClick={resetTest}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition flex items-center gap-2 mx-auto"
          >
            <span>↻</span> Reset
          </button>
        </div>

        {/* Results */}
        {isCompleted && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-light text-center mb-6 text-yellow-400">Results</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-mono text-yellow-400">{currentWpm}</div>
                <div className="text-gray-400">WPM</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-mono text-blue-400">{currentAccuracy}%</div>
                <div className="text-gray-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-mono text-red-400">{errors}</div>
                <div className="text-gray-400">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-mono text-green-400">{totalCharsTyped}</div>
                <div className="text-gray-400">Characters</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-mono text-cyan-400">{finalTime}s</div>
                <div className="text-gray-400">Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-mono text-purple-400">{score}</div>
                <div className="text-gray-400">Score</div>
              </div>
            </div>

            {wpmHistory.length > 1 && (
              <div className="mt-6">
                <h3 className="text-lg mb-4 text-center text-gray-300">WPM Over Time</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={wpmHistory}>
                    <Line
                      type="monotone"
                      dataKey="wpm"
                      stroke="#facc15"
                      strokeWidth={2}
                      dot={{ fill: '#facc15', r: 3 }}
                    />
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Auto-Submit Status */}
            <div className="mt-6 text-center">
              {isSaving && (
                <div className="text-yellow-400 font-medium">
                  Submitting score automatically...
                </div>
              )}
              
              {saveStatus && (
                <div className={`text-sm ${saveStatus.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                  {saveStatus}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 