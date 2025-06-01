'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy, Clock, Target, Play, Home, ArrowRight } from 'lucide-react';

const allQuestions = [
    {
        question: "What does HTML stand for?",
        options: ["Hyper Tool Markup Language", "Hyper Text Markup Language", "Home Tool Markup Language", "Hyper Text Making Language"],
        answer: "Hyper Text Markup Language"
    },
    {
        question: "Which language is used for styling web pages?",
        options: ["HTML", "JQuery", "CSS", "XML"],
        answer: "CSS"
    },
    {
        question: "What does CSS stand for?",
        options: ["Colorful Style Sheets", "Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets"],
        answer: "Cascading Style Sheets"
    },
    {
        question: "Which of the following is a JavaScript framework?",
        options: ["React", "Laravel", "Django", "Flask"],
        answer: "React"
    },
    {
        question: "What does API stand for?",
        options: ["Application Programming Interface", "Automated Program Interface", "Application Process Interface", "Automated Programming Interface"],
        answer: "Application Programming Interface"
    },
    {
        question: "Which database is known as a NoSQL database?",
        options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
        answer: "MongoDB"
    },
    {
        question: "What is the purpose of Git?",
        options: ["Database management", "Version control", "Web hosting", "Code compilation"],
        answer: "Version control"
    },
    {
        question: "Which HTTP status code indicates 'Not Found'?",
        options: ["200", "301", "404", "500"],
        answer: "404"
    },
    {
        question: "What does JSON stand for?",
        options: ["JavaScript Object Notation", "Java Standard Object Notation", "JavaScript Organized Notation", "Java Script Object Notation"],
        answer: "JavaScript Object Notation"
    },
    {
        question: "Which company developed React?",
        options: ["Google", "Microsoft", "Facebook", "Apple"],
        answer: "Facebook"
    },
    {
        question: "What is the default port for HTTP?",
        options: ["21", "22", "80", "443"],
        answer: "80"
    },
    {
        question: "Which programming language is known as the 'mother of all languages'?",
        options: ["C", "Assembly", "FORTRAN", "COBOL"],
        answer: "C"
    },
    {
        question: "What does SQL stand for?",
        options: ["Structured Query Language", "Standard Query Language", "Sequential Query Language", "Simple Query Language"],
        answer: "Structured Query Language"
    },
    {
        question: "Which protocol is used for secure web browsing?",
        options: ["HTTP", "HTTPS", "FTP", "SMTP"],
        answer: "HTTPS"
    },
    {
        question: "What is the purpose of a firewall?",
        options: ["Speed up internet", "Block unauthorized access", "Store data", "Compile code"],
        answer: "Block unauthorized access"
    },
    {
        question: "Which tag is used to create a hyperlink in HTML?",
        options: ["<link>", "<href>", "<a>", "<url>"],
        answer: "<a>"
    },
    {
        question: "What does DOM stand for?",
        options: ["Document Object Model", "Data Object Management", "Document Oriented Model", "Dynamic Object Model"],
        answer: "Document Object Model"
    },
    {
        question: "Which company created JavaScript?",
        options: ["Microsoft", "Netscape", "Google", "Apple"],
        answer: "Netscape"
    },
    {
        question: "What is the file extension for Python files?",
        options: [".java", ".py", ".js", ".cpp"],
        answer: ".py"
    },
    {
        question: "Which of these is NOT a programming paradigm?",
        options: ["Object-oriented", "Functional", "Procedural", "Conditional"],
        answer: "Conditional"
    },
    {
        question: "What does MVC stand for?",
        options: ["Model View Controller", "Multiple View Controller", "Model Virtual Controller", "Main View Component"],
        answer: "Model View Controller"
    },
    {
        question: "Which data structure follows LIFO principle?",
        options: ["Queue", "Stack", "Array", "Tree"],
        answer: "Stack"
    },
    {
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        answer: "O(log n)"
    },
    {
        question: "Which language is primarily used for iOS development?",
        options: ["Java", "Kotlin", "Swift", "C#"],
        answer: "Swift"
    },
    {
        question: "What does IDE stand for?",
        options: ["Integrated Development Environment", "Interactive Development Environment", "Internal Development Environment", "Independent Development Environment"],
        answer: "Integrated Development Environment"
    },
    {
        question: "Which protocol is used for email transfer?",
        options: ["HTTP", "FTP", "SMTP", "TCP"],
        answer: "SMTP"
    },
    {
        question: "What is the primary purpose of Docker?",
        options: ["Code editing", "Containerization", "Database management", "Web hosting"],
        answer: "Containerization"
    },
    {
        question: "Which sorting algorithm has the best average-case time complexity?",
        options: ["Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort"],
        answer: "Quick Sort"
    },
    {
        question: "What does CDN stand for?",
        options: ["Content Delivery Network", "Central Data Network", "Content Distribution Network", "Central Delivery Network"],
        answer: "Content Delivery Network"
    },
    {
        question: "Which HTTP method is used to update data?",
        options: ["GET", "POST", "PUT", "DELETE"],
        answer: "PUT"
    },
    {
        question: "What is the purpose of a constructor in OOP?",
        options: ["Destroy objects", "Initialize objects", "Copy objects", "Compare objects"],
        answer: "Initialize objects"
    },
    {
        question: "Which company developed Angular?",
        options: ["Facebook", "Google", "Microsoft", "Twitter"],
        answer: "Google"
    },
    {
        question: "What does RAM stand for?",
        options: ["Random Access Memory", "Read Access Memory", "Rapid Access Memory", "Real Access Memory"],
        answer: "Random Access Memory"
    },
    {
        question: "Which database uses BSON format?",
        options: ["MySQL", "PostgreSQL", "MongoDB", "Redis"],
        answer: "MongoDB"
    },
    {
        question: "What is the purpose of CSS Grid?",
        options: ["Creating animations", "Layout design", "Database queries", "API calls"],
        answer: "Layout design"
    },
    {
        question: "Which language is used for Android development?",
        options: ["Swift", "Objective-C", "Kotlin", "C#"],
        answer: "Kotlin"
    },
    {
        question: "What does CRUD stand for?",
        options: ["Create Read Update Delete", "Copy Read Update Delete", "Create Retrieve Update Delete", "Copy Retrieve Update Delete"],
        answer: "Create Read Update Delete"
    },
    {
        question: "Which tool is used for dependency management in Node.js?",
        options: ["Gradle", "Maven", "npm", "Composer"],
        answer: "npm"
    },
    {
        question: "What is the default port for HTTPS?",
        options: ["80", "443", "8080", "3000"],
        answer: "443"
    },
    {
        question: "Which design pattern ensures only one instance of a class?",
        options: ["Factory", "Observer", "Singleton", "Strategy"],
        answer: "Singleton"
    },
    {
        question: "What does AJAX stand for?",
        options: ["Asynchronous JavaScript and XML", "Advanced JavaScript and XML", "Automatic JavaScript and XML", "Active JavaScript and XML"],
        answer: "Asynchronous JavaScript and XML"
    },
    {
        question: "Which data structure is used for BFS traversal?",
        options: ["Stack", "Queue", "Tree", "Graph"],
        answer: "Queue"
    },
    {
        question: "What is the purpose of a hash table?",
        options: ["Sorting data", "Fast data retrieval", "Data compression", "Data encryption"],
        answer: "Fast data retrieval"
    },
    {
        question: "Which CSS property is used to change text color?",
        options: ["font-color", "text-color", "color", "background-color"],
        answer: "color"
    },
    {
        question: "What does ORM stand for?",
        options: ["Object Relational Mapping", "Object Resource Management", "Operational Resource Management", "Object Resource Mapping"],
        answer: "Object Relational Mapping"
    },
    {
        question: "Which JavaScript method adds an element to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        answer: "push()"
    },
    {
        question: "What is the purpose of a load balancer?",
        options: ["Data encryption", "Distribute traffic", "Store data", "Compile code"],
        answer: "Distribute traffic"
    },
    {
        question: "Which HTML tag is used for the largest heading?",
        options: ["<h6>", "<h1>", "<header>", "<title>"],
        answer: "<h1>"
    },
    {
        question: "What does REST stand for?",
        options: ["Representational State Transfer", "Remote State Transfer", "Relational State Transfer", "Resource State Transfer"],
        answer: "Representational State Transfer"
    },
    {
        question: "Which algorithm is used for shortest path in graphs?",
        options: ["DFS", "BFS", "Dijkstra", "Kruskal"],
        answer: "Dijkstra"
    },
    {
        question: "What is the purpose of middleware in web development?",
        options: ["Database queries", "Request processing", "UI rendering", "File storage"],
        answer: "Request processing"
    },
    {
        question: "Which CSS unit is relative to the viewport width?",
        options: ["px", "em", "vw", "rem"],
        answer: "vw"
    },
    {
        question: "What does SPA stand for in web development?",
        options: ["Single Page Application", "Static Page Application", "Secure Page Application", "Simple Page Application"],
        answer: "Single Page Application"
    },
    {
        question: "Which HTTP status code indicates server error?",
        options: ["200", "404", "500", "301"],
        answer: "500"
    },
    {
        question: "What is the purpose of indexing in databases?",
        options: ["Data backup", "Query optimization", "Data encryption", "User authentication"],
        answer: "Query optimization"
    },
    {
        question: "Which JavaScript feature allows functions to remember their lexical scope?",
        options: ["Hoisting", "Closure", "Prototype", "Callback"],
        answer: "Closure"
    },
    {
        question: "What does GPU stand for?",
        options: ["General Processing Unit", "Graphics Processing Unit", "Global Processing Unit", "Graphical Processing Unit"],
        answer: "Graphics Processing Unit"
    },
    {
        question: "Which design pattern is used to create objects without specifying their exact class?",
        options: ["Singleton", "Factory", "Observer", "Strategy"],
        answer: "Factory"
    },
    {
        question: "What is the purpose of version control?",
        options: ["Code compilation", "Track changes", "Bug testing", "Performance optimization"],
        answer: "Track changes"
    },
    {
        question: "Which CSS property is used for responsive design?",
        options: ["display", "position", "media queries", "float"],
        answer: "media queries"
    },
    {
        question: "What does TDD stand for?",
        options: ["Test Driven Development", "Technical Design Document", "Time Driven Development", "Test Data Development"],
        answer: "Test Driven Development"
    },
    {
        question: "Which data structure is used for implementing recursion?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        answer: "Stack"
    },
    {
        question: "What is the purpose of npm in Node.js?",
        options: ["Code compilation", "Package management", "Database connection", "Server hosting"],
        answer: "Package management"
    },
    {
        question: "Which HTML attribute specifies an alternate text for an image?",
        options: ["title", "alt", "src", "href"],
        answer: "alt"
    },
    {
        question: "What does PWA stand for?",
        options: ["Progressive Web Application", "Personal Web Application", "Public Web Application", "Protected Web Application"],
        answer: "Progressive Web Application"
    },
    {
        question: "Which CSS property controls the space between elements?",
        options: ["padding", "margin", "border", "spacing"],
        answer: "margin"
    },
    {
        question: "What is the purpose of a primary key in databases?",
        options: ["Data encryption", "Unique identification", "Data sorting", "Query optimization"],
        answer: "Unique identification"
    },
    {
        question: "Which JavaScript method converts JSON string to object?",
        options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.object()"],
        answer: "JSON.parse()"
    },
    {
        question: "What does CI/CD stand for?",
        options: ["Continuous Integration/Continuous Deployment", "Code Integration/Code Deployment", "Central Integration/Central Deployment", "Custom Integration/Custom Deployment"],
        answer: "Continuous Integration/Continuous Deployment"
    },
    {
        question: "Which sorting algorithm is most efficient for small datasets?",
        options: ["Quick Sort", "Merge Sort", "Insertion Sort", "Heap Sort"],
        answer: "Insertion Sort"
    },
    {
        question: "What is the purpose of a foreign key?",
        options: ["Primary identification", "Link tables", "Data encryption", "Index creation"],
        answer: "Link tables"
    },
    {
        question: "Which CSS framework is developed by Twitter?",
        options: ["Foundation", "Bulma", "Bootstrap", "Materialize"],
        answer: "Bootstrap"
    },
    {
        question: "What does XML stand for?",
        options: ["eXtensible Markup Language", "eXternal Markup Language", "eXecutable Markup Language", "eXtra Markup Language"],
        answer: "eXtensible Markup Language"
    },
    {
        question: "Which protocol is used for file transfer?",
        options: ["HTTP", "SMTP", "FTP", "TCP"],
        answer: "FTP"
    },
    {
        question: "What is the purpose of a cache?",
        options: ["Data backup", "Improve performance", "Data encryption", "User authentication"],
        answer: "Improve performance"
    },
    {
        question: "Which HTML5 element is used for navigation links?",
        options: ["<nav>", "<menu>", "<navigation>", "<links>"],
        answer: "<nav>"
    },
    {
        question: "What does SCSS stand for?",
        options: ["Syntactically Cascading Style Sheets", "Sassy Cascading Style Sheets", "Super Cascading Style Sheets", "Simple Cascading Style Sheets"],
        answer: "Sassy Cascading Style Sheets"
    },
    {
        question: "Which design pattern allows an object to notify other objects about changes?",
        options: ["Singleton", "Factory", "Observer", "Strategy"],
        answer: "Observer"
    },
    {
        question: "What is the purpose of async/await in JavaScript?",
        options: ["Error handling", "Asynchronous programming", "Object creation", "Variable declaration"],
        answer: "Asynchronous programming"
    },
    {
        question: "Which CSS property is used to create rounded corners?",
        options: ["corner-radius", "border-radius", "rounded-corner", "corner-round"],
        answer: "border-radius"
    },
    {
        question: "What does DRY principle stand for?",
        options: ["Don't Repeat Yourself", "Do Repeat Yourself", "Don't Remove Yourself", "Do Remove Yourself"],
        answer: "Don't Repeat Yourself"
    },
    {
        question: "Which data structure allows insertion and deletion at both ends?",
        options: ["Stack", "Queue", "Deque", "Array"],
        answer: "Deque"
    },
    {
        question: "What is the purpose of TypeScript?",
        options: ["Database management", "Add static typing to JavaScript", "Create animations", "Server hosting"],
        answer: "Add static typing to JavaScript"
    },
    {
        question: "Which HTML attribute is used to specify inline styles?",
        options: ["class", "id", "style", "css"],
        answer: "style"
    },
    {
        question: "What does SOLID principles refer to?",
        options: ["Database design", "Object-oriented design", "Web security", "Network protocols"],
        answer: "Object-oriented design"
    },
    {
        question: "Which JavaScript method removes the last element from an array?",
        options: ["push()", "pop()", "shift()", "splice()"],
        answer: "pop()"
    },
    {
        question: "What is the purpose of a reverse proxy?",
        options: ["Data encryption", "Forward client requests", "Store cache", "Compile code"],
        answer: "Forward client requests"
    },
    {
        question: "Which CSS display property removes an element from the document flow?",
        options: ["block", "inline", "none", "flex"],
        answer: "none"
    },
    {
        question: "What does SEO stand for?",
        options: ["Search Engine Optimization", "Secure Engine Optimization", "Search Engine Operation", "System Engine Optimization"],
        answer: "Search Engine Optimization"
    },
    {
        question: "Which algorithm is used to find the minimum spanning tree?",
        options: ["Dijkstra", "DFS", "Kruskal", "BFS"],
        answer: "Kruskal"
    },
    {
        question: "What is the purpose of webpack?",
        options: ["Database management", "Module bundling", "Server hosting", "Code testing"],
        answer: "Module bundling"
    },
    {
        question: "Which CSS property controls text alignment?",
        options: ["align", "text-align", "alignment", "text-position"],
        answer: "text-align"
    },
    {
        question: "What does NoSQL stand for?",
        options: ["No Structured Query Language", "Not only SQL", "New SQL", "Non SQL"],
        answer: "Not only SQL"
    },
    {
        question: "Which HTTP method is idempotent?",
        options: ["POST", "GET", "PATCH", "All of the above"],
        answer: "GET"
    },
    {
        question: "What is the purpose of a CDN?",
        options: ["Data backup", "Content delivery", "Code compilation", "User authentication"],
        answer: "Content delivery"
    },
    {
        question: "Which JavaScript feature allows extending objects?",
        options: ["Closure", "Prototype", "Hoisting", "Callback"],
        answer: "Prototype"
    },
    {
        question: "What does CORS stand for?",
        options: ["Cross-Origin Resource Sharing", "Cross-Object Resource Sharing", "Central Origin Resource Sharing", "Common Origin Resource Sharing"],
        answer: "Cross-Origin Resource Sharing"
    },
    {
        question: "Which data type is used to store true/false values?",
        options: ["String", "Integer", "Boolean", "Float"],
        answer: "Boolean"
    },
    {
        question: "What is the purpose of unit testing?",
        options: ["Performance optimization", "Test individual components", "User interface design", "Database management"],
        answer: "Test individual components"
    },
    {
        question: "Which CSS property is used to control element opacity?",
        options: ["visibility", "display", "opacity", "transparent"],
        answer: "opacity"
    }
];

export default function TechQuizApp() {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(15);
    const [quizStarted, setQuizStarted] = useState(false);

    useEffect(() => {
        if (quizStarted && !showResult && timeRemaining > 0 && !showAnswerFeedback) {
            const timer = setTimeout(() => {
                setTimeRemaining(timeRemaining - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeRemaining === 0 && !showAnswerFeedback) {
            handleTimeUp();
        }
    }, [timeRemaining, showResult, showAnswerFeedback, quizStarted]);

    const startQuiz = () => {
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 10));
        setQuizStarted(true);
        setCurrentIndex(0);
        setScore(0);
        setShowResult(false);
        setTimeRemaining(15);
    };

    const handleAnswer = (selectedOption) => {
        setSelectedAnswer(selectedOption);
        setShowAnswerFeedback(true);

        if (selectedOption === questions[currentIndex].answer) {
            setScore(score + 1);
        }

        setTimeout(() => {
            moveToNext();
        }, 2000);
    };

    const handleTimeUp = () => {
        setSelectedAnswer(null);
        setShowAnswerFeedback(true);

        setTimeout(() => {
            moveToNext();
        }, 2000);
    };

    const moveToNext = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentIndex(nextIndex);
            setSelectedAnswer(null);
            setShowAnswerFeedback(false);
            setTimeRemaining(15);
        } else {
            setShowResult(true);
        }
    };

    const resetQuiz = () => {
        setQuizStarted(false);
        setQuestions([]);
        setCurrentIndex(0);
        setScore(0);
        setShowResult(false);
        setSelectedAnswer(null);
        setShowAnswerFeedback(false);
        setTimeRemaining(15);
    };

    const getScoreColor = () => {
        const percentage = (score / questions.length) * 100;
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreMessage = () => {
        const percentage = (score / questions.length) * 100;
        if (percentage >= 90) return 'Outstanding! 🎉';
        if (percentage >= 80) return 'Excellent! 👏';
        if (percentage >= 70) return 'Good Job! 👍';
        if (percentage >= 60) return 'Not Bad! 😊';
        return 'Keep Learning! 📚';
    };

    if (!quizStarted) {
        return (
            <div className="bg-white flex items-center justify-center py-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-[#018ABE] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Target className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Tech Quiz Challenge</h1>
                    <p className="text-gray-600 mb-8">Test your knowledge with 10 random questions from our database of 100 tech questions!</p>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-[#018ABE]">100</div>
                            <div className="text-xs text-gray-600">Questions</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">10</div>
                            <div className="text-xs text-gray-600">Per Quiz</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">15s</div>
                            <div className="text-xs text-gray-600">Per Question</div>
                        </div>
                    </div>

                    <button
                        onClick={startQuiz}
                        className="w-full bg-[#018ABE] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-[#01729e] transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                    >
                        <Play className="w-5 h-5" />
                        Start Quiz
                    </button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (showResult) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-[#018ABE] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
                    <p className={`text-2xl font-bold mb-4 ${getScoreColor()}`}>{getScoreMessage()}</p>

                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <div className="text-4xl font-bold text-gray-800 mb-2">
                            {score} / {questions.length}
                        </div>
                        <div className="text-gray-600">
                            {Math.round((score / questions.length) * 100)}% Correct
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={resetQuiz}
                            className="bg-[#018ABE] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#01729e] transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Retry
                        </button>
                        <button
                            onClick={() => setQuizStarted(false)}
                            className="bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium text-gray-600">
                            Question {currentIndex + 1} of {questions.length}
                        </span>
                        <div className="flex items-center gap-2 text-red-500">
                            <Clock className="w-4 h-4" />
                            <span className="font-bold text-lg">{timeRemaining}s</span>
                        </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-8 leading-relaxed">
                        {currentQuestion.question}
                    </h2>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => {
                            let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 font-medium ";

                            if (showAnswerFeedback) {
                                if (option === currentQuestion.answer) {
                                    buttonClass += "bg-green-50 border-green-500 text-green-700";
                                } else if (option === selectedAnswer && option !== currentQuestion.answer) {
                                    buttonClass += "bg-red-50 border-red-500 text-red-700";
                                } else {
                                    buttonClass += "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed";
                                }
                            } else {
                                buttonClass += "bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 cursor-pointer";
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => !showAnswerFeedback && handleAnswer(option)}
                                    disabled={showAnswerFeedback}
                                    className={buttonClass}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{option}</span>
                                        {showAnswerFeedback && option === currentQuestion.answer && (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        )}
                                        {showAnswerFeedback && option === selectedAnswer && option !== currentQuestion.answer && (
                                            <XCircle className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {showAnswerFeedback && (
                        <button
                            onClick={moveToNext}
                            className="w-full mt-6 bg-[#018ABE] text-white py-4 px-6 rounded-xl font-semibold hover:bg-[#01729e] transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                        >
                            Next Question <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-100">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold text-gray-700">Score: {score}/{questions.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}