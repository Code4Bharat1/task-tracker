import React from 'react';
import { useRouter } from 'next/navigation';

export default function Games() {
    const router = useRouter();

    const handleGameNavigation = (gameName) => {
        router.push(`/games/${gameName}`);
    };

    const games = [
        { name: 'binary', displayName: 'Binary Game', icon: '🔢' },
        { name: 'chess', displayName: 'Chess', icon: '♛' },
        { name: 'debug', displayName: 'Debug Game', icon: '🐛' },
        { name: 'itquiz', displayName: 'IT Quiz', icon: '💻' },
        { name: 'ludo', displayName: 'Ludo', icon: '🎲' },
        { name: 'tictactoe', displayName: 'Tic Tac Toe', icon: '⭕' },
        { name: 'wordpuzzle', displayName: 'Word Search Puzzle', icon: '🧩' },
        { name: 'typing', displayName: 'Typing Speed Test', icon: '⌨️' }
    ];

    return (
        <div className= "bg-white text-black p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-12 text-blue-400">
                    Games
                </h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {games.map((game, index) => (
                        <button
                            key={game.name}
                            onClick={() => handleGameNavigation(game.name)}
                            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-400 rounded-lg p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-400/20 group"
                        >
                            <div className="text-center">
                                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                                    {game.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-200 group-hover:text-blue-400 transition-colors duration-300">
                                    {game.displayName}
                                </h3>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-400 text-sm">
                        Choose a game to start playing!
                    </p>
                </div>
            </div>
        </div>
    );
}