'use client';
import React, { useState, useEffect } from 'react';
import { Bug, CheckCircle, XCircle, Trophy, Clock, Code, Lightbulb, RotateCcw, Play } from 'lucide-react';
import { axiosInstance } from '@/lib/axiosInstance';
const codeProblems = [
    {
        id: 1,
        title: "Array Push Method",
        language: "JavaScript",
        difficulty: "Easy",
        buggyCode: `function addItem(arr, item) {
  arr.push(item);
  return arr.length();
}`,
        correctCode: `function addItem(arr, item) {
  arr.push(item);
  return arr.length;
}`,
        bug: "arr.length() should be arr.length (length is a property, not a method)",
        explanation: "The length property of an array doesn't need parentheses - it's a property, not a method.",
        options: [
            "Change arr.push(item) to arr.append(item)",
            "Remove parentheses from arr.length()",
            "Add semicolon after return statement",
            "Change function to arrow function"
        ],
        correctAnswer: "Remove parentheses from arr.length()"
    },
    {
        id: 2,
        title: "For Loop Condition",
        language: "JavaScript",
        difficulty: "Easy",
        buggyCode: `function printNumbers() {
  for (let i = 0; i <= 5; i++) {
    console.log(i);
  }
}`,
        correctCode: `function printNumbers() {
  for (let i = 0; i < 5; i++) {
    console.log(i);
  }
}`,
        bug: "Loop condition i <= 5 should be i < 5 to print 0-4",
        explanation: "The condition i <= 5 will print numbers 0 through 5 (6 numbers). If we want 5 numbers (0-4), use i < 5.",
        options: [
            "Change i <= 5 to i < 5",
            "Change i++ to i--",
            "Add curly braces around console.log",
            "Change let to var"
        ],
        correctAnswer: "Change i <= 5 to i < 5"
    },
    {
        id: 3,
        title: "Object Property Access",
        language: "JavaScript",
        difficulty: "Easy",
        buggyCode: `const user = {
  name: "John",
  age: 25
};
console.log(user.name);
console.log(user[age]);`,
        correctCode: `const user = {
  name: "John",
  age: 25
};
console.log(user.name);
console.log(user["age"]);`,
        bug: "user[age] should be user['age'] - missing quotes around property name",
        explanation: "When using bracket notation to access object properties, the property name must be a string in quotes.",
        options: [
            "Change user[age] to user['age']",
            "Change const to let",
            "Add semicolon after age: 25",
            "Remove console.log statements"
        ],
        correctAnswer: "Change user[age] to user['age']"
    },
    {
        id: 4,
        title: "Function Declaration",
        language: "JavaScript",
        difficulty: "Medium",
        buggyCode: `function calculateArea(radius) {
  const pi = 3.14159;
  return pi * radius * radius;
}

result = calculateArea(5);
console.log(result);`,
        correctCode: `function calculateArea(radius) {
  const pi = 3.14159;
  return pi * radius * radius;
}

const result = calculateArea(5);
console.log(result);`,
        bug: "Missing 'const', 'let', or 'var' declaration for result variable",
        explanation: "Variables should be properly declared with const, let, or var to avoid creating global variables accidentally.",
        options: [
            "Add const before result",
            "Change function to arrow function",
            "Remove return statement",
            "Change pi to Math.PI"
        ],
        correctAnswer: "Add const before result"
    },
    {
        id: 5,
        title: "Array Method",
        language: "JavaScript",
        difficulty: "Medium",
        buggyCode: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(function(num) {
  num * 2;
});
console.log(doubled);`,
        correctCode: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(function(num) {
  return num * 2;
});
console.log(doubled);`,
        bug: "Missing 'return' statement in map function",
        explanation: "The map function expects a return value. Without 'return', the function returns undefined for each element.",
        options: [
            "Add return before num * 2",
            "Change map to forEach",
            "Remove function keyword",
            "Add semicolon after num * 2"
        ],
        correctAnswer: "Add return before num * 2"
    },
    {
        id: 6,
        title: "Conditional Statement",
        language: "JavaScript",
        difficulty: "Easy",
        buggyCode: `function checkAge(age) {
  if (age = 18) {
    return "Adult";
  } else {
    return "Minor";
  }
}`,
        correctCode: `function checkAge(age) {
  if (age >= 18) {
    return "Adult";
  } else {
    return "Minor";
  }
}`,
        bug: "Using assignment (=) instead of comparison (>=) in if condition",
        explanation: "The condition uses assignment (=) instead of comparison. It should be >= to check if age is 18 or older.",
        options: [
            "Change age = 18 to age >= 18",
            "Add parentheses around condition",
            "Change else to else if",
            "Remove return statements"
        ],
        correctAnswer: "Change age = 18 to age >= 18"
    },
    {
        id: 7,
        title: "String Concatenation",
        language: "JavaScript",
        difficulty: "Easy",
        buggyCode: `function greetUser(name) {
  return "Hello, " + name + "!";
}

console.log(greetUser());`,
        correctCode: `function greetUser(name) {
  return "Hello, " + name + "!";
}

console.log(greetUser("User"));`,
        bug: "Function called without required parameter",
        explanation: "The greetUser function expects a 'name' parameter, but it's called without any arguments, resulting in 'Hello, undefined!'.",
        options: [
            "Add a parameter when calling greetUser()",
            "Remove the name parameter from function",
            "Change + to comma in concatenation",
            "Add default parameter value"
        ],
        correctAnswer: "Add a parameter when calling greetUser()"
    },
    {
        id: 8,
        title: "Array Index Access",
        language: "JavaScript",
        difficulty: "Medium",
        buggyCode: `const fruits = ["apple", "banana", "orange"];
console.log(fruits[3]);
console.log("Total fruits:", fruits.length);`,
        correctCode: `const fruits = ["apple", "banana", "orange"];
console.log(fruits[2]);
console.log("Total fruits:", fruits.length);`,
        bug: "Accessing index 3 in array with only 3 elements (indices 0-2)",
        explanation: "Arrays are zero-indexed. An array with 3 elements has indices 0, 1, and 2. Index 3 is undefined.",
        options: [
            "Change fruits[3] to fruits[2]",
            "Add another fruit to the array",
            "Change console.log to alert",
            "Remove the length property"
        ],
        correctAnswer: "Change fruits[3] to fruits[2]"
    },
    {
        id: 9,
        title: "JSON Parsing",
        language: "JavaScript",
        difficulty: "Medium",
        buggyCode: `const jsonString = '{"name": "John", "age": 30}';
const obj = JSON.parse(jsonString);
console.log(obj.name);
console.log(obj.height);`,
        correctCode: `const jsonString = '{"name": "John", "age": 30}';
const obj = JSON.parse(jsonString);
console.log(obj.name);
console.log(obj.age);`,
        bug: "Trying to access 'height' property that doesn't exist in the JSON object",
        explanation: "The JSON object only contains 'name' and 'age' properties. Accessing 'height' returns undefined.",
        options: [
            "Change obj.height to obj.age",
            "Add height property to JSON string",
            "Remove JSON.parse()",
            "Change const to let"
        ],
        correctAnswer: "Change obj.height to obj.age"
    },
    {
        id: 10,
        title: "Function Scope",
        language: "JavaScript",
        difficulty: "Hard",
        buggyCode: `function outer() {
  let x = 10;
  
  function inner() {
    console.log(y);
  }
  
  inner();
}

outer();`,
        correctCode: `function outer() {
  let x = 10;
  
  function inner() {
    console.log(x);
  }
  
  inner();
}

outer();`,
        bug: "Variable 'y' is not defined in the scope",
        explanation: "The inner function tries to access variable 'y' which doesn't exist. It should access 'x' from the outer scope.",
        options: [
            "Change console.log(y) to console.log(x)",
            "Declare y in outer function",
            "Remove inner function",
            "Change let to var"
        ],
        correctAnswer: "Change console.log(y) to console.log(x)"
    },
    {
        id: 11,
        title: "CSS Selector",
        language: "CSS",
        difficulty: "Easy",
        buggyCode: `.button {
  background-color: blue;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
}

#submit-btn {
  background-color: green;
}`,
        correctCode: `.button {
  background-color: blue;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
}

.button#submit-btn {
  background-color: green;
}`,
        bug: "ID selector has lower specificity than needed to override class styles",
        explanation: "To override the .button class styles, you need higher specificity. Use .button#submit-btn instead of just #submit-btn.",
        options: [
            "Change #submit-btn to .button#submit-btn",
            "Add !important to background-color",
            "Remove the .button class",
            "Change # to . in submit-btn"
        ],
        correctAnswer: "Change #submit-btn to .button#submit-btn"
    },
    {
        id: 12,
        title: "HTML Structure",
        language: "HTML",
        difficulty: "Easy",
        buggyCode: `<html>
<head>
  <title>My Page</title>
</head>
<body>
  <h1>Welcome</h1>
  <p>This is a paragraph.</p>
</body>`,
        correctCode: `<html>
<head>
  <title>My Page</title>
</head>
<body>
  <h1>Welcome</h1>
  <p>This is a paragraph.</p>
</body>
</html>`,
        bug: "Missing closing </html> tag",
        explanation: "Every HTML document should have a closing </html> tag to properly close the document structure.",
        options: [
            "Add closing </html> tag",
            "Remove <html> opening tag",
            "Change <body> to <div>",
            "Add DOCTYPE declaration"
        ],
        correctAnswer: "Add closing </html> tag"
    },
    {
        id: 13,
        title: "Python Function",
        language: "Python",
        difficulty: "Easy",
        buggyCode: `def calculate_sum(a, b):
    result = a + b
    return result

print(calculate_sum(5, 3)`,
        correctCode: `def calculate_sum(a, b):
    result = a + b
    return result

print(calculate_sum(5, 3))`,
        bug: "Missing closing parenthesis in print statement",
        explanation: "The print function call is missing its closing parenthesis, which will cause a syntax error.",
        options: [
            "Add closing parenthesis to print statement",
            "Remove opening parenthesis from print",
            "Change print to console.log",
            "Add semicolon at the end"
        ],
        correctAnswer: "Add closing parenthesis to print statement"
    },
    {
        id: 14,
        title: "Python List",
        language: "Python",
        difficulty: "Medium",
        buggyCode: `numbers = [1, 2, 3, 4, 5]
for i in range(len(numbers)):
    print(numbers[i])
    
print(numbers[5])`,
        correctCode: `numbers = [1, 2, 3, 4, 5]
for i in range(len(numbers)):
    print(numbers[i])
    
print(numbers[4])`,
        bug: "Index out of range - accessing index 5 in list with 5 elements (indices 0-4)",
        explanation: "Lists are zero-indexed. A list with 5 elements has indices 0-4. Index 5 will raise an IndexError.",
        options: [
            "Change numbers[5] to numbers[4]",
            "Add another number to the list",
            "Remove the print statement",
            "Change range to xrange"
        ],
        correctAnswer: "Change numbers[5] to numbers[4]"
    },
    {
        id: 15,
        title: "Python Dictionary",
        language: "Python",
        difficulty: "Medium",
        buggyCode: `student = {
    "name": "Alice",
    "age": 20,
    "grade": "A"
}

print(student["major"])`,
        correctCode: `student = {
    "name": "Alice",
    "age": 20,
    "grade": "A"
}

print(student.get("major", "Not specified"))`,
        bug: "Trying to access a key that doesn't exist in the dictionary",
        explanation: "The dictionary doesn't have a 'major' key. This will raise a KeyError. Use .get() method with a default value.",
        options: [
            "Use student.get('major', 'Not specified')",
            "Add 'major' key to dictionary",
            "Remove the print statement",
            "Change dictionary to list"
        ],
        correctAnswer: "Use student.get('major', 'Not specified')"
    },
    {
        id: 16,
        title: "String Comparison",
        language: "JavaScript",
        difficulty: "Easy",
        buggyCode: `const password = "secret123";
const userInput = "Secret123";

if (password === userInput) {
    console.log("Access granted");
} else {
    console.log("Access denied");
}`,
        correctCode: `const password = "secret123";
const userInput = "Secret123";

if (password.toLowerCase() === userInput.toLowerCase()) {
    console.log("Access granted");
} else {
    console.log("Access denied");
}`,
        bug: "Case-sensitive comparison when case shouldn't matter",
        explanation: "The comparison is case-sensitive. For case-insensitive comparison, convert both strings to the same case.",
        options: [
            "Add .toLowerCase() to both strings",
            "Change === to ==",
            "Remove the else clause",
            "Use length comparison instead"
        ],
        correctAnswer: "Add .toLowerCase() to both strings"
    },
    {
        id: 17,
        title: "Array Filter",
        language: "JavaScript",
        difficulty: "Medium",
        buggyCode: `const numbers = [1, 2, 3, 4, 5];
const evenNumbers = numbers.filter(num => {
    num % 2 === 0;
});
console.log(evenNumbers);`,
        correctCode: `const numbers = [1, 2, 3, 4, 5];
const evenNumbers = numbers.filter(num => {
    return num % 2 === 0;
});
console.log(evenNumbers);`,
        bug: "Missing return statement in filter callback",
        explanation: "The filter callback needs an explicit return statement when using curly braces.",
        options: [
            "Add return before num % 2 === 0",
            "Remove curly braces",
            "Change filter to map",
            "Add semicolon after condition"
        ],
        correctAnswer: "Add return before num % 2 === 0"
    },
    {
        id: 18,
        title: "Object Method",
        language: "JavaScript",
        difficulty: "Medium",
        buggyCode: `const calculator = {
    value: 0,
    add: function(num) {
        this.value += num;
    },
    subtract: function(num) {
        this.value -= num;
    },
    show: () => {
        console.log(this.value);
    }
};

calculator.add(5);
calculator.show();`,
        correctCode: `const calculator = {
    value: 0,
    add: function(num) {
        this.value += num;
    },
    subtract: function(num) {
        this.value -= num;
    },
    show: function() {
        console.log(this.value);
    }
};

calculator.add(5);
calculator.show();`,
        bug: "Arrow function doesn't bind 'this' to the object",
        explanation: "Arrow functions don't have their own 'this' context. Use regular function syntax for object methods.",
        options: [
            "Change arrow function to regular function",
            "Move value outside object",
            "Add bind(this) to arrow function",
            "Change this to calculator"
        ],
        correctAnswer: "Change arrow function to regular function"
    },
    {
        id: 19,
        title: "Event Listener",
        language: "JavaScript",
        difficulty: "Medium",
        buggyCode: `document.querySelector('button').addEventListener('click', handleClick());

function handleClick() {
    console.log('Button clicked');
}`,
        correctCode: `document.querySelector('button').addEventListener('click', handleClick);

function handleClick() {
    console.log('Button clicked');
}`,
        bug: "Calling handleClick immediately instead of passing as callback",
        explanation: "The function is being called immediately (with parentheses) instead of being passed as a callback.",
        options: [
            "Remove parentheses after handleClick",
            "Change 'click' to 'onclick'",
            "Add return to handleClick",
            "Move function declaration before event listener"
        ],
        correctAnswer: "Remove parentheses after handleClick"
    },
    {
        id: 20,
        title: "Template Literal",
        language: "JavaScript",
        difficulty: "Easy",
        buggyCode: `const name = "Alice";
const age = 25;
console.log("Name: " + name + ", Age: " + age);`,
        correctCode: `const name = "Alice";
const age = 25;
console.log(\`Name: \${name}, Age: \${age}\`);`,
        bug: "Using concatenation instead of template literals",
        explanation: "Template literals (backticks) provide cleaner string interpolation than concatenation.",
        options: [
            "Use template literals with ${}",
            "Change + to comma",
            "Remove all quotes",
            "Use join() instead"
        ],
        correctAnswer: "Use template literals with ${}"
    },
    {
        id: 21,
        title: "Async/Await",
        language: "JavaScript",
        difficulty: "Hard",
        buggyCode: `async function fetchData() {
    const response = fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
}`,
        correctCode: `async function fetchData() {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
}`,
        bug: "Missing await for fetch call",
        explanation: "The fetch call returns a promise and needs to be awaited before calling .json() on the response.",
        options: [
            "Add await before fetch",
            "Remove async from function",
            "Change .json() to .text()",
            "Add try/catch block"
        ],
        correctAnswer: "Add await before fetch"
    },
    {
        id: 22,
        title: "CSS Units",
        language: "CSS",
        difficulty: "Easy",
        buggyCode: `.container {
    width: 100%;
    padding: 20;
    margin: 10px;
}`,
        correctCode: `.container {
    width: 100%;
    padding: 20px;
    margin: 10px;
}`,
        bug: "Missing unit for padding value",
        explanation: "CSS length values require units (px, em, rem, etc.) unless the value is 0.",
        options: [
            "Add px unit to padding",
            "Remove padding property",
            "Change width to 100vw",
            "Add quotes around 20"
        ],
        correctAnswer: "Add px unit to padding"
    },
    {
        id: 23,
        title: "HTML Form",
        language: "HTML",
        difficulty: "Easy",
        buggyCode: `<form>
    <input type="text" name="username">
    <button>Submit</button>
</form>`,
        correctCode: `<form>
    <input type="text" name="username" required>
    <button type="submit">Submit</button>
</form>`,
        bug: "Missing form validation and submit type",
        explanation: "For better form handling, add required attribute and specify button type.",
        options: [
            "Add required and type='submit'",
            "Change form to div",
            "Remove name attribute",
            "Add method='POST'"
        ],
        correctAnswer: "Add required and type='submit'"
    },
    {
        id: 24,
        title: "Python Loop",
        language: "Python",
        difficulty: "Easy",
        buggyCode: `fruits = ['apple', 'banana', 'orange']
for i in range(fruits):
    print(fruits[i])`,
        correctCode: `fruits = ['apple', 'banana', 'orange']
for fruit in fruits:
    print(fruit)`,
        bug: "Incorrect loop syntax for iterating through list",
        explanation: "Python allows direct iteration over list elements without using range and index.",
        options: [
            "Use for fruit in fruits syntax",
            "Change range to len(fruits)",
            "Add enumerate() function",
            "Remove square brackets"
        ],
        correctAnswer: "Use for fruit in fruits syntax"
    },
    {
        id: 25,
        title: "Python String Format",
        language: "Python",
        difficulty: "Medium",
        buggyCode: `name = "Bob"
age = 30
print("Name: %s, Age: %d" % name % age)`,
        correctCode: `name = "Bob"
age = 30
print("Name: %s, Age: %d" % (name, age))`,
        bug: "Incorrect string formatting syntax",
        explanation: "When using % formatting with multiple values, they must be in a tuple.",
        options: [
            "Put variables in tuple (name, age)",
            "Use f-string instead",
            "Remove % symbols",
            "Add commas between variables"
        ],
        correctAnswer: "Put variables in tuple (name, age)"
    },
    {
        id: 26,
        title: "React Component",
        language: "JavaScript",
        difficulty: "Hard",
        buggyCode: `function Greeting() {
    return (
        <div>
            <h1>Hello World</h1>
            <p>Welcome to our site</p>
        </div>
        <div>
            <button>Click me</button>
        </div>
    );
}`,
        correctCode: `function Greeting() {
    return (
        <div>
            <h1>Hello World</h1>
            <p>Welcome to our site</p>
            <button>Click me</button>
        </div>
    );
}`,
        bug: "Multiple root elements in React component return",
        explanation: "React components must return a single root element (can be a Fragment <> </>).",
        options: [
            "Combine into single root div",
            "Add React.Fragment wrapper",
            "Remove one div",
            "Change to class component"
        ],
        correctAnswer: "Combine into single root div"
    },
    {
        id: 27,
        title: "React State",
        language: "JavaScript",
        difficulty: "Medium",
        buggyCode: `function Counter() {
    let count = 0;
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => count++}>
                Increment
            </button>
        </div>
    );
}`,
        correctCode: `function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}`,
        bug: "Using regular variable instead of state",
        explanation: "React won't re-render when regular variables change. Must use useState hook for state management.",
        options: [
            "Use useState hook",
            "Add forceUpdate() call",
            "Change to class component",
            "Add this.state"
        ],
        correctAnswer: "Use useState hook"
    },
    {
        id: 28,
        title: "CSS Flexbox",
        language: "CSS",
        difficulty: "Medium",
        buggyCode: `.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.item {
    flex: 1;
    margin: 0 10px;
}`,
        correctCode: `.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.item {
    flex: 1;
}`,
        bug: "Using margins for flex item spacing",
        explanation: "The gap property is now widely supported and provides better spacing control in flex containers.",
        options: [
            "Replace margins with gap on container",
            "Remove flex properties",
            "Add padding instead",
            "Use grid instead"
        ],
        correctAnswer: "Replace margins with gap on container"
    },
    {
        id: 29,
        title: "HTML Semantic",
        language: "HTML",
        difficulty: "Easy",
        buggyCode: `<div id="header">
    <div class="nav">
        <div>Home</div>
        <div>About</div>
    </div>
</div>`,
        correctCode: `<header>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
    </nav>
</header>`,
        bug: "Using divs instead of semantic elements",
        explanation: "HTML5 semantic elements (header, nav, etc.) improve accessibility and SEO.",
        options: [
            "Use semantic elements and anchor tags",
            "Add role attributes",
            "Change divs to spans",
            "Add onclick handlers"
        ],
        correctAnswer: "Use semantic elements and anchor tags"
    },
    {
        id: 30,
        title: "Python Import",
        language: "Python",
        difficulty: "Easy",
        buggyCode: `import math

print(math.sqrt(9))
print(math.PI)`,
        correctCode: `import math

print(math.sqrt(9))
print(math.pi)`,
        bug: "Incorrect case for math.pi constant",
        explanation: "Python is case-sensitive. The math module constant is 'pi' (lowercase), not 'PI'.",
        options: [
            "Change PI to pi",
            "Add quotes around PI",
            "Use math.pi()",
            "Import pi directly"
        ],
        correctAnswer: "Change PI to pi"
    }
];

export default function DebugCodeGame() {
    const [currentProblem, setCurrentProblem] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [currentSelectedAnswer, setCurrentSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes = 300 seconds
    const [problems, setProblems] = useState([]);
    const [gameComplete, setGameComplete] = useState(false);
    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [gameStartTime, setGameStartTime] = useState(null);
    const [completionTime, setCompletionTime] = useState(null);//completion time is stored here
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    // Shuffle function
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const submitScoreToBackend = async () => {
        setIsSaving(true);
        setSaveStatus('Saving score...');
        try {
            const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/gamescore/submit`, {
                gameName: 'Debug Code Game',
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
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    useEffect(() => {
        if (gameComplete && completionTime !== null && score >= 0) {
            submitScoreToBackend();
        }
    }, [gameComplete, completionTime, score]);

    useEffect(() => {
        if (gameStarted && !gameComplete && timeRemaining > 0) {
            const timer = setTimeout(() => {
                setTimeRemaining(time => time - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeRemaining === 0 && !gameComplete) {
            endGame();
        }
    }, [timeRemaining, gameStarted, gameComplete]);

    const startGame = () => {
        const shuffled = [...codeProblems].sort(() => 0.5 - Math.random()).slice(0, 10);
        setProblems(shuffled);
        setCurrentProblem(shuffled[0]);
        setShuffledOptions(shuffleArray(shuffled[0].options));
        setGameStarted(true);
        setGameStartTime(Date.now());
        setCurrentIndex(0);
        setScore(0);
        setSelectedAnswers([]);
        setCurrentSelectedAnswer(null);
        setShowFeedback(false);
        setTimeRemaining(300);
        setGameComplete(false);
        setCompletionTime(null);
    };

    const handleAnswer = (answer) => {
        setCurrentSelectedAnswer(answer);
        setShowFeedback(true);

        const newSelectedAnswers = [...selectedAnswers];
        newSelectedAnswers[currentIndex] = answer;
        setSelectedAnswers(newSelectedAnswers);

        if (answer === currentProblem.correctAnswer) {
            setScore(prev => prev + 1);
        }

        // Move to next question after 2 seconds
        setTimeout(() => {
            moveToNext();
        }, 2000);
    };

    const moveToNext = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < problems.length) {
            setCurrentIndex(nextIndex);
            setCurrentProblem(problems[nextIndex]);
            setShuffledOptions(shuffleArray(problems[nextIndex].options));
            setCurrentSelectedAnswer(null);
            setShowFeedback(false);
        } else {
            endGame();
        }
    };

    const endGame = () => {
        if (!gameComplete) {
            setGameComplete(true);
            if (gameStartTime) {
                const endTime = Date.now();
                const timeTaken = Math.floor((endTime - gameStartTime) / 1000);
                setCompletionTime(timeTaken);
            }
        }
    };

    const resetGame = () => {
        setGameStarted(false);
        setCurrentProblem(null);
        setCurrentIndex(0);
        setScore(0);
        setSelectedAnswers([]);
        setCurrentSelectedAnswer(null);
        setShowFeedback(false);
        setTimeRemaining(300);
        setProblems([]);
        setGameComplete(false);
        setShuffledOptions([]);
        setGameStartTime(null);
        setCompletionTime(null);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getLanguageColor = (language) => {
        switch (language) {
            case 'JavaScript': return 'bg-yellow-500';
            case 'Python': return 'bg-blue-500';
            case 'CSS': return 'bg-purple-500';
            case 'HTML': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!gameStarted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-[#018ABE] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bug className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Debug the Code</h1>
                    <p className="text-gray-600 mb-8">Find and fix bugs in code snippets across different programming languages!</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">30</div>
                            <div className="text-xs text-gray-600">Code Problems</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">10</div>
                            <div className="text-xs text-gray-600">Per Game</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">5</div>
                            <div className="text-xs text-gray-600">Minutes Total</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">4</div>
                            <div className="text-xs text-gray-600">Languages</div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-semibold text-gray-800 mb-3">Languages Covered:</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">JavaScript</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Python</span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">CSS</span>
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">HTML</span>
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        className="w-full bg-[#018ABE] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-[#01729e] transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                    >
                        <Play className="w-5 h-5" />
                        Start Debugging
                    </button>
                </div>
            </div>
        );
    }

    if (gameComplete) {
        const percentage = Math.round((score / problems.length) * 100);
        const getScoreMessage = () => {
            if (percentage >= 90) return 'Debugging Master! 🏆';
            if (percentage >= 80) return 'Excellent Debugger! 👏';
            if (percentage >= 70) return 'Good Detective Work! 🕵️';
            if (percentage >= 60) return 'Keep Practicing! 💪';
            return 'More Practice Needed! 📚';
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-[#018ABE] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Complete!</h1>
                        <p className="text-2xl font-bold mb-4 text-orange-600">{getScoreMessage()}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-50 rounded-xl p-6 text-center">
                            <div className="text-4xl font-bold text-gray-800 mb-2">
                                {score} / {problems.length}
                            </div>
                            <div className="text-gray-600 mb-2">
                                {percentage}% Bugs Fixed
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#018ABE] h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 text-center">
                            <div className="text-4xl font-bold text-gray-800 mb-2">
                                {completionTime ? formatTime(completionTime) : formatTime(300 - timeRemaining)}
                            </div>
                            <div className="text-gray-600">
                                Time {completionTime && currentIndex >= problems.length ? 'Taken' : 'Elapsed'}
                            </div>
                        </div>
                    </div>

                    {/* Review Section */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Review:</h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {problems.map((problem, index) => {
                                const userAnswer = selectedAnswers[index];
                                const isCorrect = userAnswer === problem.correctAnswer;

                                return (
                                    <div key={problem.id} className={`p-4 rounded-lg border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                        }`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-800">
                                                    {index + 1}. {problem.title}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(problem.difficulty)}`}>
                                                    {problem.difficulty}
                                                </span>
                                            </div>
                                            {isCorrect ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>

                                        {userAnswer && (
                                            <div className="text-sm">
                                                <p className={`mb-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                    <strong>Your answer:</strong> {userAnswer}
                                                </p>
                                                {!isCorrect && (
                                                    <p className="text-green-700">
                                                        <strong>Correct answer:</strong> {problem.correctAnswer}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {!userAnswer && (
                                            <p className="text-gray-600 text-sm">
                                                <strong>Not answered</strong> - Correct answer: {problem.correctAnswer}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={resetGame}
                        className="w-full bg-[#018ABE] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-[#01729e] transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Debug Again
                    </button>
                </div>
            </div>
        );
    }

    const progress = ((currentIndex + 1) / problems.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-600">
                                Problem {currentIndex + 1} of {problems.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getLanguageColor(currentProblem.language)}`}></div>
                                <span className="text-sm font-medium text-gray-700">{currentProblem.language}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentProblem.difficulty)}`}>
                                {currentProblem.difficulty}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-red-500">
                            <Clock className="w-4 h-4" />
                            <span className="font-bold text-lg">{formatTime(timeRemaining)}</span>
                        </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-[#018ABE] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gray-800 text-white p-4 flex items-center gap-2">
                            <Code className="w-5 h-5" />
                            <h3 className="font-semibold">{currentProblem.title}</h3>
                        </div>
                        <div className="p-6">
                            <h4 className="font-semibold text-gray-800 mb-3">🐛 Buggy Code:</h4>
                            <div className="bg-gray-900 text-green-400 p-4 rounded-lg mb-4 font-mono text-sm overflow-x-auto">
                                <pre>{currentProblem.buggyCode}</pre>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">What's the bug in this code?</h3>

                        <div className="space-y-3">
                            {shuffledOptions.map((option, index) => {
                                let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 font-medium ";

                                if (showFeedback) {
                                    if (option === currentProblem.correctAnswer) {
                                        buttonClass += "bg-green-50 border-green-500 text-green-700";
                                    } else if (option === currentSelectedAnswer && option !== currentProblem.correctAnswer) {
                                        buttonClass += "bg-red-50 border-red-500 text-red-700";
                                    } else {
                                        buttonClass += "bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed";
                                    }
                                } else {
                                    buttonClass += "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300";
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => !showFeedback && handleAnswer(option)}
                                        disabled={showFeedback}
                                        className={buttonClass}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{option}</span>
                                            {showFeedback && (
                                                <div>
                                                    {option === currentProblem.correctAnswer && (
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                    )}
                                                    {option === currentSelectedAnswer && option !== currentProblem.correctAnswer && (
                                                        <XCircle className="w-5 h-5 text-red-600" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {!showFeedback && (
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-700 text-sm">
                                    💡 <strong>Tip:</strong> Look carefully at the code structure, syntax, and logic. Common bugs include missing semicolons, incorrect operators, and undefined variables.
                                </p>
                            </div>
                        )}

                        {showFeedback && (
                            <div className="mt-6">
                                {currentSelectedAnswer === currentProblem.correctAnswer ? (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                            <span className="font-semibold text-green-800">Correct! +1 point</span>
                                        </div>
                                        <p className="text-green-700 text-sm">{currentProblem.explanation}</p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <XCircle className="w-6 h-6 text-red-600" />
                                            <span className="font-semibold text-red-800">Incorrect</span>
                                        </div>
                                        <p className="text-red-700 text-sm mb-2">
                                            <strong>Correct answer:</strong> {currentProblem.correctAnswer}
                                        </p>
                                        <p className="text-red-700 text-sm">{currentProblem.explanation}</p>
                                    </div>
                                )}
                                <p className="text-center text-gray-600 text-sm mt-3">
                                    Moving to next question...
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="fixed bottom-4 right-4 bg-white rounded-full shadow-lg p-4 border border-gray-200">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#018ABE]">{score}</div>
                        <div className="text-xs text-gray-600">Score</div>
                    </div>
                </div>
            </div>
        </div>
    );
}