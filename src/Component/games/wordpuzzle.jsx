import React, { useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'react-hot-toast';

const WordPuzzleGame = () => {
  const [grid, setGrid] = useState([]);
  const allWords = ['REACT', 'JAVASCRIPT', 'PUZZLE', 'GAME', 'CODE', 'HTML', 'CSS', 'PYTHON', 'ANGULAR', 'NODE', 'REDUX', 'WEBPACK', 'BABEL', 'GITHUB', 'SWIFT', 'KOTLIN', 'FLUTTER', 'DOCKER', 'MONGODB', 'MYSQL', 'FIREBASE', 'NEXTJS', 'VUEJS', 'TYPESCRIPT', 'JQUERY', 'BOOTSTRAP', 'TAILWIND', 'SASS', 'GRAPHQL', 'RESTAPI', 'ALGORITHM', 'POLYMORPHISM', 'ENCAPSULATION', 'INHERITANCE', 'ABSTRACTION', 'RECURSION', 'SYNCHRONIZATION', 'ASYNCHRONOUS', 'MULTITHREADING', 'AUTHENTICATION', 'AUTHORIZATION', 'CRYPTOGRAPHY', 'BLOCKCHAIN', 'MICROSERVICES', 'VIRTUALIZATION', 'CONTAINERIZATION', 'ORCHESTRATION', 'DEPLOYMENT', 'DEBUGGING', 'REFACTORING', 'OPTIMIZATION', 'SCALABILITY', 'ARCHITECTURE', 'METHODOLOGY', 'FRAMEWORKS', 'LIBRARIES', 'DEPENDENCIES', 'REPOSITORY', 'CONFIGURATION', 'INTEGRATION', 'COMPILATION', 'INTERPRETATION', 'SERIALIZATION', 'DESERIALIZATION', 'MIDDLEWARE', 'PREPROCESSING', 'POSTPROCESSING', 'TRANSFORMATION', 'VALIDATION', 'SANITIZATION', 'NORMALIZATION'];
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [foundWordPositions, setFoundWordPositions] = useState({});
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [wordPlacements, setWordPlacements] = useState({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitScore = async () => {
    setIsSubmitting(true);
    console.log(score)
    console.log(gameOver);
    try {
      // Using axios directly with full URL
      await axiosInstance.post('/gameScore/submit', {
        gameName: 'word puzzle',
        score: score
      });
      toast.success('Score submitted successfully!');
      setGameOver(true);
    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error('Failed to submit score.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (timeLeft === 0) {
      submitScore();
    }
  }, [timeLeft]);

  const GRID_SIZE = 12;

  // Color palette for straps
  const strapColors = [
    'bg-red-500/80',
    'bg-blue-500/80',
    'bg-green-500/80',
    'bg-yellow-500/80',
    'bg-purple-500/80',
    'bg-pink-500/80',
    'bg-indigo-500/80',
    'bg-orange-500/80',
    'bg-teal-500/80',
    'bg-cyan-500/80',
    'bg-lime-500/80',
    'bg-rose-500/80',
    'bg-emerald-500/80',
    'bg-violet-500/80'
  ];

  // Generate random words for each game
  const generateRandomWords = () => {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10); // Changed from 8 to 10 words
  };

  // Generate random letter
  const randomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));

  // Check if position is valid
  const isValidPosition = (row, col) => row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;

  // Check if word can be placed at position
  const canPlaceWord = (grid, word, startRow, startCol, direction) => {
    const directions = {
      horizontal: [0, 1],
      vertical: [1, 0],
      diagonal: [1, 1],
      diagonalUp: [-1, 1]
    };

    const [dr, dc] = directions[direction];

    // Check if all positions are valid and either empty or match the letter
    for (let i = 0; i < word.length; i++) {
      const r = startRow + dr * i;
      const c = startCol + dc * i;

      if (!isValidPosition(r, c)) return false;

      // If cell is not empty, it must match the current letter
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
        return false;
      }
    }
    return true;
  };

  // Place word in grid
  const placeWord = (grid, word, startRow, startCol, direction) => {
    const directions = {
      horizontal: [0, 1],
      vertical: [1, 0],
      diagonal: [1, 1],
      diagonalUp: [-1, 1]
    };

    const [dr, dc] = directions[direction];
    const positions = [];

    if (!canPlaceWord(grid, word, startRow, startCol, direction)) {
      return null;
    }

    // Place the word
    for (let i = 0; i < word.length; i++) {
      const r = startRow + dr * i;
      const c = startCol + dc * i;
      grid[r][c] = word[i];
      positions.push({ row: r, col: c });
    }

    return positions;
  };

  // Generate puzzle grid
  const generateGrid = useCallback(() => {
    // Start with empty grid
    const newGrid = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill('')
    );

    const directions = ['horizontal', 'vertical', 'diagonal', 'diagonalUp'];
    const newWordPlacements = {};
    const placedWords = [];

    // Try to place each word
    words.forEach(word => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 200) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const startRow = Math.floor(Math.random() * GRID_SIZE);
        const startCol = Math.floor(Math.random() * GRID_SIZE);

        const positions = placeWord(newGrid, word, startRow, startCol, direction);
        if (positions) {
          placed = true;
          placedWords.push(word);
          newWordPlacements[word] = {
            positions,
            direction,
            startRow,
            startCol
          };
        }
        attempts++;
      }

      if (!placed) {
        console.warn(`Could not place word: ${word}`);
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

    setGrid(newGrid);
    setWordPlacements(newWordPlacements);

    // Update words list to only include successfully placed words
    if (placedWords.length !== words.length) {
      console.log(`Successfully placed ${placedWords.length} out of ${words.length} words`);
    }
  }, [words]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (gameActive && gameStarted && timeLeft > 0 && !gameCompleted) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameStarted) {
      setGameActive(false);
      setGameOver(true);
    }
    return () => clearInterval(interval);
  }, [gameActive, gameStarted, timeLeft, gameCompleted]);

  // Calculate final score based on words found and time remaining
  const calculateFinalScore = () => {
    const wordScore = foundWords.length * 100;
    const timeBonus = timeLeft * 2;
    return wordScore + timeBonus;
  };

  // Initialize game
  useEffect(() => {
    const randomWords = generateRandomWords();
    setWords(randomWords);
  }, []);

  // Generate grid when words change
  useEffect(() => {
    if (words.length > 0) {
      generateGrid();
      setFoundWords([]);
      setFoundWordPositions({});
      setScore(0);
      setGameCompleted(false);
      setGameActive(false);
      setGameOver(false);
      setGameStarted(false);
      setTimeLeft(30);
    }
  }, [words, generateGrid]);

  // Check if game is completed
  useEffect(() => {
    if (foundWords.length === words.length && words.length > 0) {
      setGameCompleted(true);
      setGameActive(false);
      setScore(calculateFinalScore());
    }
  }, [foundWords, words, timeLeft]);

  // Get cell key
  const getCellKey = (row, col) => `${row}-${col}`;

  // Handle mouse down
  const handleMouseDown = (row, col) => {
    if (!gameActive || gameOver || !gameStarted) return;
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  // Handle mouse enter
  const handleMouseEnter = (row, col) => {
    if (!isSelecting || !gameActive || gameOver || !gameStarted) return;

    setSelectedCells(current => {
      if (current.length === 0) return [{ row, col }];

      const start = current[0];
      const cells = [];

      const rowDiff = row - start.row;
      const colDiff = col - start.col;

      if (rowDiff === 0) {
        // Horizontal
        const step = colDiff > 0 ? 1 : -1;
        for (let c = start.col; c !== col + step; c += step) {
          cells.push({ row: start.row, col: c });
        }
      } else if (colDiff === 0) {
        // Vertical
        const step = rowDiff > 0 ? 1 : -1;
        for (let r = start.row; r !== row + step; r += step) {
          cells.push({ row: r, col: start.col });
        }
      } else if (Math.abs(rowDiff) === Math.abs(colDiff)) {
        // Diagonal
        const rowStep = rowDiff > 0 ? 1 : -1;
        const colStep = colDiff > 0 ? 1 : -1;
        const steps = Math.abs(rowDiff);

        for (let i = 0; i <= steps; i++) {
          cells.push({
            row: start.row + i * rowStep,
            col: start.col + i * colStep
          });
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
        setFoundWords(prev => [...prev, wordFound]);
        setFoundWordPositions(prev => ({
          ...prev,
          [wordFound]: {
            positions: wordPositions,
            color: strapColors[Object.keys(prev).length % strapColors.length]
          }
        }));
        setScore(prev => prev + wordFound.length * 10);
      }
    }

    setIsSelecting(false);
    setSelectedCells([]);
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameActive(true);
  };

  // New game
  const newGame = () => {
    const randomWords = generateRandomWords();
    setWords(randomWords);
    setFoundWords([]);
    setFoundWordPositions({});
    setSelectedCells([]);
    setScore(0);
    setGameCompleted(false);
    setWordPlacements({});
    setGameActive(false);
    setGameOver(false);
    setGameStarted(false);
    setTimeLeft(30);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            🧩 Word Search Puzzle
          </h1>
          <p className="text-purple-200 text-lg">Find the hidden words in the grid!</p>
        </div>

        {/* Instructions - moved to top */}
        <div className="mb-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl text-center">
          <h3 className="text-xl font-bold text-white mb-2">📖 How to Play</h3>
          <p className="text-purple-200">
            Click the START button to begin the game and start the 5-minute timer.
            Once started, click and drag to select words in the grid. Words can be horizontal, vertical, or diagonal.
            Find all the words within 5 minutes to complete the puzzle! You cannot select words before clicking START.
          </p>
        </div>

        {/* Game Completed - moved between instructions and game */}
        {gameCompleted && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 shadow-2xl text-center animate-bounce">
            <h2 className="text-3xl font-bold text-white mb-2">🎉 Congratulations!</h2>
            <p className="text-white text-lg">You found all the words!</p>
            <p className="text-green-100 mt-2 text-xl">Final Score: {score}</p>
            <p className="text-green-100 text-sm">Time Bonus: {timeLeft * 2} points</p>
          </div>
        )}

        {/* Game Over - moved between instructions and game */}
        {gameOver && !gameCompleted && (
          <div className="mb-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-6 shadow-2xl text-center animate-pulse">
            <h2 className="text-3xl font-bold text-white mb-2">⏰ Time's Up!</h2>
            <p className="text-white text-lg">You found {foundWords.length} out of {words.length} words</p>
            <p className="text-red-100 mt-2 text-xl">Final Score: {foundWords.length * 100}</p>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-8 items-center justify-center">
          {/* Game Grid */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex-shrink-0">
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

                  // Check if this cell is part of any found word
                  const foundWordStraps = Object.entries(foundWordPositions)
                    .filter(([word, data]) =>
                      data.positions.some(pos => pos.row === rowIndex && pos.col === colIndex)
                    )
                    .map(([word, data]) => data.color);

                  return (
                    <div
                      key={getCellKey(rowIndex, colIndex)}
                      className={`
                        w-12 h-12 flex items-center justify-center text-lg font-bold relative
                        border border-white/20 cursor-pointer transition-all duration-150
                        hover:scale-110 hover:shadow-lg
                        ${isSelected
                          ? 'bg-yellow-400 text-black shadow-lg scale-110 z-10'
                          : 'bg-white/20 text-white hover:bg-white/30'
                        }
                        ${(!gameActive || gameOver || !gameStarted) ? 'cursor-not-allowed opacity-50' : ''}
                      `}
                      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                      onMouseUp={handleMouseUp}
                    >
                      {/* Found word straps */}
                      {foundWordStraps.map((strapColor, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 ${strapColor} 
                            ${index === 0 ? 'opacity-80' : 'opacity-60'}
                            ${index > 0 ? 'transform rotate-45' : ''}
                            ${index > 1 ? 'transform -rotate-45' : ''}
                          `}
                          style={{
                            zIndex: index + 1,
                            transform: index === 1 ? 'rotate(45deg)' : index === 2 ? 'rotate(-45deg)' : 'none'
                          }}
                        />
                      ))}
                      <span className="relative z-10 drop-shadow-sm">{cell}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Game Info */}
          <div className="space-y-6 w-full max-w-sm">
            {/* Timer */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl text-center">
              <h2 className="text-2xl font-bold text-white mb-4">⏱️ Time</h2>
              <div className={`text-3xl font-bold ${timeLeft <= 60 ? 'text-red-400' : 'text-green-400'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Score */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl text-center">
              <h2 className="text-2xl font-bold text-white mb-4">🏆 Score</h2>
              <div className="text-3xl font-bold text-yellow-400">{score}</div>
            </div>

            {/* Words to Find */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">🎯 Find These Words</h2>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {words.map((word, index) => (
                  <div
                    key={word}
                    className={`
                      px-3 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-between text-xs
                      ${foundWords.includes(word)
                        ? `${foundWordPositions[word]?.color || 'bg-green-500'} text-white line-through`
                        : 'bg-white/20 text-white'
                      }
                    `}
                  >
                    <span className="truncate">{word}</span>
                    {foundWords.includes(word) && (
                      <div
                        className={`w-3 h-3 rounded-full ${foundWordPositions[word]?.color || 'bg-green-500'} 
                          border border-white flex-shrink-0 ml-1`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-purple-200 text-center">
                Found: {foundWords.length} / {words.length}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
              {!gameStarted ? (
                <button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg mb-2"
                >
                  🚀 START GAME
                </button>
              ) : null}
              <button
                onClick={newGame}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
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