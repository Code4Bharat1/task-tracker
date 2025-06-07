import { axiosInstance } from '@/lib/axiosInstance';
import React, { useState, useEffect, useCallback, useRef } from 'react';

const WordPuzzleGame = () => {
  const [grid, setGrid] = useState([]);
  const allWords = ['REACT', 'JAVASCRIPT', 'PUZZLE', 'GAME', 'CODE', 'HTML', 'CSS', 'PYTHON', 'ANGULAR', 'NODE', 'REDUX', 'WEBPACK', 'BABEL', 'GITHUB', 'SWIFT', 'KOTLIN', 'FLUTTER', 'DOCKER', 'MONGODB', 'MYSQL', 'FIREBASE', 'NEXTJS', 'VUEJS', 'TYPESCRIPT', 'JQUERY', 'BOOTSTRAP', 'TAILWIND', 'SASS', 'GRAPHQL', 'RESTAPI', 'ALGORITHM'];
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [foundWordPositions, setFoundWordPositions] = useState({});
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [wordPlacements, setWordPlacements] = useState({});
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [completionTime, setCompletionTime] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Game duration in seconds (10 seconds for testing)
  const GAME_DURATION = 300;
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

  // Use refs to avoid stale closures in timer
  const gameActiveRef = useRef(false);
  const gameStartedRef = useRef(false);
  const gameCompletedRef = useRef(false);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const scoreSubmittedRef = useRef(false); // Track if score has been submitted

  const GRID_SIZE = 15;

  // Light, eye-friendly color palette
  const strapColors = [
    'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300',
    'bg-gradient-to-r from-green-100 to-green-200 border-green-300',
    'bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300',
    'bg-gradient-to-r from-pink-100 to-pink-200 border-pink-300',
    'bg-gradient-to-r from-indigo-100 to-indigo-200 border-indigo-300',
    'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300',
    'bg-gradient-to-r from-teal-100 to-teal-200 border-teal-300',
    'bg-gradient-to-r from-cyan-100 to-cyan-200 border-cyan-300',
    'bg-gradient-to-r from-lime-100 to-lime-200 border-lime-300',
    'bg-gradient-to-r from-rose-100 to-rose-200 border-rose-300',
    'bg-gradient-to-r from-emerald-100 to-emerald-200 border-emerald-300',
    'bg-gradient-to-r from-violet-100 to-violet-200 border-violet-300',
    'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300',
    'bg-gradient-to-r from-sky-100 to-sky-200 border-sky-300'
  ];

  // Backend score submission function
  const submitScoreToBackend = async (finalScore, finalTime) => {
    setIsSaving(true);
    setSaveStatus('Saving score...');

    const dataToSend = {
      gameName: 'Word Puzzle Game',
      score: finalScore,
      time: finalTime,
    };

    try {
      const response = await axiosInstance.post('/gamescore/submit', dataToSend);
      setSaveStatus('Score saved successfully! 🎉');
    } catch (error) {
      setSaveStatus(`Failed to save score: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
      // Clear save status after 3 seconds
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Update refs when state changes
  useEffect(() => {
    gameActiveRef.current = gameActive;
  }, [gameActive]);

  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);

  useEffect(() => {
    gameCompletedRef.current = gameCompleted;
  }, [gameCompleted]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  // Generate random words for each game
  const generateRandomWords = () => {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 12);
  };

  // Generate random letter
  const randomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));

  // Check if position is valid
  const isValidPosition = (row, col) => row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;

  // Get all 8 directions for word placement
  const getDirections = () => [
    { name: 'horizontal', dr: 0, dc: 1 },
    { name: 'vertical', dr: 1, dc: 0 },
    { name: 'diagonal', dr: 1, dc: 1 },
    { name: 'diagonalUp', dr: -1, dc: 1 },
    { name: 'horizontalReverse', dr: 0, dc: -1 },
    { name: 'verticalReverse', dr: -1, dc: 0 },
    { name: 'diagonalReverse', dr: -1, dc: -1 },
    { name: 'diagonalUpReverse', dr: 1, dc: -1 }
  ];

  // Check if word can be placed at position
  const canPlaceWord = (grid, word, startRow, startCol, dr, dc) => {
    for (let i = 0; i < word.length; i++) {
      const r = startRow + dr * i;
      const c = startCol + dc * i;

      if (!isValidPosition(r, c)) return false;

      if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
        return false;
      }
    }
    return true;
  };

  // Place word in grid
  const placeWord = (grid, word, startRow, startCol, dr, dc) => {
    const positions = [];

    if (!canPlaceWord(grid, word, startRow, startCol, dr, dc)) {
      return null;
    }

    for (let i = 0; i < word.length; i++) {
      const r = startRow + dr * i;
      const c = startCol + dc * i;
      grid[r][c] = word[i];
      positions.push({ row: r, col: c });
    }

    return positions;
  };

  // Generate puzzle grid with improved algorithm
  const generateGrid = useCallback((wordList) => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill('')
    );

    const directions = getDirections();
    const newWordPlacements = {};
    const placedWords = [];

    const sortedWords = [...wordList].sort((a, b) => b.length - a.length);

    sortedWords.forEach(word => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 500;

      while (!placed && attempts < maxAttempts) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const { dr, dc } = direction;

        const maxStartRow = dr >= 0 ? GRID_SIZE - word.length : word.length - 1;
        const minStartRow = dr >= 0 ? 0 : word.length - 1;
        const maxStartCol = dc >= 0 ? GRID_SIZE - word.length : word.length - 1;
        const minStartCol = dc >= 0 ? 0 : word.length - 1;

        if (maxStartRow >= minStartRow && maxStartCol >= minStartCol) {
          const startRow = Math.floor(Math.random() * (maxStartRow - minStartRow + 1)) + minStartRow;
          const startCol = Math.floor(Math.random() * (maxStartCol - minStartCol + 1)) + minStartCol;

          const positions = placeWord(newGrid, word, startRow, startCol, dr, dc);
          if (positions) {
            placed = true;
            placedWords.push(word);
            newWordPlacements[word] = {
              positions,
              direction: direction.name,
              startRow,
              startCol,
              dr,
              dc
            };
          }
        }
        attempts++;
      }

      if (!placed) {
        console.warn(`Could not place word: ${word} after ${maxAttempts} attempts`);
      }
    });

    // Fill empty cells with random letters
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = randomLetter();
        }
      }
    }

    return { newGrid, newWordPlacements, placedWords };
  }, []);

  // Fixed timer effect - handles both completion and time up scenarios
  useEffect(() => {
    let interval = null;

    if (gameActiveRef.current && gameStartedRef.current && !gameCompletedRef.current && !gameOverRef.current) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            // Time's up - end game and save score
            const finalTime = GAME_DURATION; // Full time elapsed
            const finalScore = scoreRef.current;

            // Set states
            setGameActive(false);
            setGameOver(true);
            setCompletionTime(finalTime);

            // Submit score only if not already submitted
            if (!scoreSubmittedRef.current) {
              scoreSubmittedRef.current = true;
              submitScoreToBackend(finalScore, finalTime);
            }

            // Reveal unfound words
            setFoundWords(prevFoundWords => {
              setWords(prevWords => {
                const unfoundWords = prevWords.filter(word => !prevFoundWords.includes(word));

                setFoundWordPositions(prevPositions => {
                  const newPositions = { ...prevPositions };

                  unfoundWords.forEach((word) => {
                    setWordPlacements(prevPlacements => {
                      if (prevPlacements[word]) {
                        newPositions[word] = {
                          positions: prevPlacements[word].positions,
                          color: 'bg-gradient-to-r from-red-100 to-red-200 border-red-400',
                          isRevealed: true
                        };
                      }
                      return prevPlacements;
                    });
                  });

                  return newPositions;
                });

                return prevWords;
              });
              return prevFoundWords;
            });

            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameActive, gameStarted, gameCompleted, gameOver]);

  // Initialize game
  useEffect(() => {
    const initializeGame = () => {
      const randomWords = generateRandomWords();
      const { newGrid, newWordPlacements, placedWords } = generateGrid(randomWords);

      setGrid(newGrid);
      setWordPlacements(newWordPlacements);
      setWords(placedWords);
      setFoundWords([]);
      setFoundWordPositions({});
      setSelectedCells([]);
      setScore(0);
      setGameCompleted(false);
      setGameActive(false);
      setGameOver(false);
      setGameStarted(false);
      setTimeLeft(GAME_DURATION);
      setCompletionTime(null);
      setSaveStatus('');
      scoreSubmittedRef.current = false; // Reset submission tracker
    };

    initializeGame();
  }, [generateGrid]);

  // Check if game is completed (all words found)
  useEffect(() => {
    if (foundWords.length === words.length && 
        words.length > 0 && 
        !gameCompleted && 
        !gameOver && 
        !scoreSubmittedRef.current) {
      
      const finalTime = GAME_DURATION - timeLeft;
      const finalScore = score;

      // Set completion states
      setGameCompleted(true);
      setGameActive(false);
      setCompletionTime(finalTime);

      // Submit score only once
      scoreSubmittedRef.current = true;
      submitScoreToBackend(finalScore, finalTime);
    }
  }, [foundWords.length, words.length, gameCompleted, gameOver, timeLeft, score]);

  // Get cell key
  const getCellKey = (row, col) => `${row}-${col}`;

  // Handle mouse down
  const handleMouseDown = (row, col) => {
    if (!gameActive || gameOver || !gameStarted) return;
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  // Handle mouse enter with improved line detection
  const handleMouseEnter = (row, col) => {
    if (!isSelecting || !gameActive || gameOver || !gameStarted) return;

    setSelectedCells(current => {
      if (current.length === 0) return [{ row, col }];

      const start = current[0];
      const cells = [];

      const rowDiff = row - start.row;
      const colDiff = col - start.col;

      if (rowDiff === 0) {
        const step = colDiff > 0 ? 1 : -1;
        for (let c = start.col; c !== col + step; c += step) {
          if (c >= 0 && c < GRID_SIZE) {
            cells.push({ row: start.row, col: c });
          }
        }
      } else if (colDiff === 0) {
        const step = rowDiff > 0 ? 1 : -1;
        for (let r = start.row; r !== row + step; r += step) {
          if (r >= 0 && r < GRID_SIZE) {
            cells.push({ row: r, col: start.col });
          }
        }
      } else if (Math.abs(rowDiff) === Math.abs(colDiff)) {
        const rowStep = rowDiff > 0 ? 1 : -1;
        const colStep = colDiff > 0 ? 1 : -1;
        const steps = Math.abs(rowDiff);

        for (let i = 0; i <= steps; i++) {
          const newRow = start.row + i * rowStep;
          const newCol = start.col + i * colStep;
          if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
            cells.push({ row: newRow, col: newCol });
          }
        }
      }

      return cells.length > 0 ? cells : current;
    });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (!gameActive || gameOver || !gameStarted) return;

    if (selectedCells.length > 1) {
      const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
      const reverseWord = selectedWord.split('').reverse().join('');

      let wordFound = '';
      let wordPositions = [];

      if (words.includes(selectedWord) && !foundWords.includes(selectedWord)) {
        wordFound = selectedWord;
        wordPositions = [...selectedCells];
      } else if (words.includes(reverseWord) && !foundWords.includes(reverseWord)) {
        wordFound = reverseWord;
        wordPositions = [...selectedCells];
      }

      if (wordFound) {
        // Add 1 point for each found word
        setScore(prevScore => prevScore + 1);

        setFoundWords(prev => [...prev, wordFound]);
        setFoundWordPositions(prev => ({
          ...prev,
          [wordFound]: {
            positions: wordPositions,
            color: strapColors[Object.keys(prev).length % strapColors.length],
            isRevealed: false
          }
        }));
      }
    }

    setIsSelecting(false);
    setSelectedCells([]);
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameActive(true);
    setGameOver(false);
    setGameCompleted(false);
    setSaveStatus('');
    scoreSubmittedRef.current = false; // Reset submission tracker
  };

  // New game
  const newGame = () => {
    const randomWords = generateRandomWords();
    const { newGrid, newWordPlacements, placedWords } = generateGrid(randomWords);

    setGrid(newGrid);
    setWordPlacements(newWordPlacements);
    setWords(placedWords);
    setFoundWords([]);
    setFoundWordPositions({});
    setSelectedCells([]);
    setScore(0);
    setGameCompleted(false);
    setGameActive(false);
    setGameOver(false);
    setGameStarted(false);
    setTimeLeft(GAME_DURATION);
    setCompletionTime(null);
    setSaveStatus('');
    scoreSubmittedRef.current = false; // Reset submission tracker
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-slate-800 mb-3 drop-shadow-sm">
            🔍 Word Search Adventure
          </h1>
          <p className="text-slate-600 text-xl font-medium">Find all hidden words in all directions!</p>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className={`mb-4 p-4 rounded-lg text-center ${saveStatus.includes('successfully')
              ? 'bg-green-100 text-green-800 border border-green-300'
              : saveStatus.includes('Failed')
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}>
            {isSaving && <span className="animate-spin mr-2">⏳</span>}
            {saveStatus}
          </div>
        )}

        {/* Game Status Messages */}
        {gameCompleted && (
          <div className="mb-6 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-3xl p-8 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-green-800 mb-3">Congratulations!</h2>
            <p className="text-green-700 text-xl mb-2">Perfect Score! You found all the words!</p>
            <div className="flex justify-center gap-8 text-green-600">
              <p className="text-2xl font-bold">Score: {score}</p>
              <p className="text-lg">Time: {formatTime(completionTime || 0)}</p>
            </div>
          </div>
        )}

        {gameOver && !gameCompleted && (
          <div className="mb-6 bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 rounded-3xl p-8 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-4xl font-bold text-red-800 mb-3">Time's Up!</h2>
            <p className="text-red-700 text-xl mb-2">You found {foundWords.length} out of {words.length} words</p>
            <p className="text-2xl font-bold text-red-600">Score: {score}</p>
            <p className="text-red-500 text-sm mt-3">💡 Unfound words are now highlighted in red!</p>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-8 items-start justify-center">
          {/* Game Grid */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-slate-200">
            <div
              className="grid gap-1 select-none mx-auto"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
              onMouseLeave={() => {
                setIsSelecting(false);
                setSelectedCells([]);
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const isSelected = selectedCells.some(
                    selected => selected.row === rowIndex && selected.col === colIndex
                  );

                  const foundWordEntry = Object.entries(foundWordPositions).find(([word, data]) =>
                    data.positions.some(pos => pos.row === rowIndex && pos.col === colIndex)
                  );

                  const hasFoundWord = foundWordEntry !== undefined;
                  const wordColor = foundWordEntry ? foundWordEntry[1].color : '';
                  const isRevealed = foundWordEntry ? foundWordEntry[1].isRevealed : false;

                  return (
                    <div
                      key={getCellKey(rowIndex, colIndex)}
                      className={`
                        w-10 h-10 flex items-center justify-center text-sm font-bold relative
                        border-2 transition-all duration-200 cursor-pointer
                        ${isSelected
                          ? 'bg-gradient-to-r from-yellow-200 to-orange-200 text-slate-800 shadow-md scale-110 z-20 border-yellow-400'
                          : hasFoundWord
                            ? `${wordColor} text-slate-800 shadow-sm border-2 ${isRevealed ? 'border-red-400 animate-pulse' : ''}`
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:scale-105'
                        }
                        ${(!gameActive || gameOver || !gameStarted) ? 'cursor-not-allowed opacity-60' : ''}
                        rounded-lg
                      `}
                      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                      onMouseUp={handleMouseUp}
                    >
                      <span className="relative z-10 font-black">
                        {cell}
                      </span>
                      {/* Revealed word indicator */}
                      {isRevealed && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white animate-bounce"></div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Game Info Panel */}
          <div className="space-y-6 w-full max-w-sm">
            {/* Game Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-slate-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">⏱️ Time</h3>
                  <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-green-600'}`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">🏆 Score</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {score}
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-3 text-center">📖 How to Play</h3>
              <div className="text-slate-600 text-sm space-y-2">
                <p>• Click START to begin the 10-second timer</p>
                <p>• Click and drag to select words</p>
                <p>• Words can be in any direction</p>
                <p>• Find all words to win!</p>
              </div>
            </div>

            {/* Words List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">🎯 Words to Find</h3>

              <div className="flex flex-wrap gap-2 justify-center">
                {words.map((word) => {
                  const wordData = foundWordPositions[word];
                  const isFound = foundWords.includes(word);
                  const isRevealed = wordData && wordData.isRevealed;

                  return (
                    <div
                      key={word}
                      className={`
                        px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between border-2
                        ${isFound && !isRevealed
                          ? `${wordData?.color || 'bg-green-100 border-green-300'} text-slate-800 line-through shadow-sm`
                          : isRevealed
                            ? 'bg-gradient-to-r from-red-100 to-red-200 text-slate-800 border-red-400 animate-pulse'
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                        }
                      `}
                    >
                      <span className="text-sm font-bold">{word}</span>
                      {(isFound || isRevealed) && (
                        <div className="flex items-center space-x-2 ml-2">
                          {isFound && !isRevealed && (
                            <div className="text-green-600 text-lg">✓</div>
                          )}
                          {isRevealed && (
                            <div className="text-red-500 text-lg animate-bounce">👁️</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-center">
                <div className="text-slate-600 font-semibold">
                  Progress: {foundWords.length} / {words.length}
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 mt-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${words.length > 0 ? (foundWords.length / words.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-slate-200">
              {!gameStarted ? (
                <button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-md mb-3 text-lg"
                >
                  🚀 START GAME
                </button>
              ) : null}
              <button
                onClick={newGame}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-md text-lg"
              >
                🎮 New Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordPuzzleGame;