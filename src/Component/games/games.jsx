import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axiosInstance';

export default function Games() {

    const [userGames, setUserGames] = useState([]);
    // useEffect(() => {
    //     const fetchUsers = async () => {
    //         try {
    //             const res = await axiosInstance.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/registration/all`);
    //             console.log(res.data);
    //             setUserGames(res.data.data.games || []);

    //         } catch (error) {
    //             console.error('Error fetching users:', error);
    //         }
    //     };
    
    //     fetchUsers();
    // }, []);

    const router = useRouter();
    const [showLeaderBoard, setShowLeaderBoard] = useState(false);
    const [selectedGame, setSelectedGame] = useState('all');

    const handleGameNavigation = (gameName) => {
        router.push(`/games/${gameName}`);
    };

    const games = [
        { name: 'binary', displayName: 'Binary Game', icon: '🔢' },
        { name: 'chess', displayName: 'Chess', icon: '♛' },
        { name: 'debug', displayName: 'Debug Game', icon: '🐛' },
        { name: 'itquiz', displayName: 'IT Quiz', icon: '💻' },
        { name: 'drawize', displayName: 'Drawize', icon: '🎲' },
        { name: 'tictactoe', displayName: 'Tic Tac Toe', icon: '⭕' },
        { name: 'wordpuzzle', displayName: 'Word Search', icon: '🧩' },
        { name: 'typing', displayName: 'Typing Speed Test', icon: '⌨️' }
    ];

    // Sample leaderboard data - replace with actual data from your backend
    const leaderboardData = [
        { player: 'Player1', game: 'binary', score: 2500 },
        { player: 'Player2', game: 'chess', score: 1800 },
        { player: 'Player3', game: 'typing', score: 3200 },
        { player: 'Player4', game: 'itquiz', score: 1950 },
        { player: 'Player5', game: 'binary', score: 2100 },
        { player: 'Player6', game: 'wordsearch', score: 1600 },
        { player: 'Player1', game: 'chess', score: 1200 },
        { player: 'Player2', game: 'typing', score: 2800 },
        { player: 'Player3', game: 'binary', score: 1900 },
    ];

    const getFilteredLeaderboard = () => {
        let filteredData = leaderboardData;

        if (selectedGame !== 'all') {
            filteredData = leaderboardData.filter(entry => entry.game === selectedGame);
        }

        // Group by player and calculate total games and total score
        const playerStats = {};
        filteredData.forEach(entry => {
            if (!playerStats[entry.player]) {
                playerStats[entry.player] = {
                    player: entry.player,
                    totalGames: 0,
                    totalScore: 0
                };
            }
            playerStats[entry.player].totalGames += 1;
            playerStats[entry.player].totalScore += entry.score;
        });

        return Object.values(playerStats).sort((a, b) => b.totalScore - a.totalScore);
    };

    return (
        <div className="bg-white text-black p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold text-blue-400">Games</h1>
                    <button
                        onClick={() => setShowLeaderBoard(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                        <span className="text-xl">🏆</span> Leader Board
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {games.map((game) => {
                        const isClickable = userGames.includes(game.name);

                        return (
                            <div key={game.name} className="relative">
                                <button
                                    onClick={() => isClickable && handleGameNavigation(game.name)}
                                    disabled={!isClickable}
                                    className={`border rounded-lg p-6 transition-all duration-300 transform group w-full
                    ${isClickable
                                            ? "bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-blue-400 hover:scale-105 hover:shadow-lg hover:shadow-blue-400/20"
                                            : "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    <div className="text-center">
                                        <div className={`text-4xl mb-3 transition-transform duration-300 ${isClickable ? "group-hover:scale-110" : ""}`}>
                                            {game.icon}
                                        </div>
                                        <h3 className={`text-lg font-semibold ${isClickable ? "text-gray-200 group-hover:text-blue-400" : "text-gray-400"}`}>
                                            {game.displayName}
                                        </h3>
                                    </div>
                                </button>
                                {!isClickable && (
                                    <div className="absolute inset-0 bg-transparent bg-opacity-50 rounded-lg flex items-center justify-center">
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-400 text-sm">Choose a game to start playing!</p>
                </div>
            </div>

            {showLeaderBoard && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center">
                                <div className="text-3xl mr-3">🏆</div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Leader Board
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowLeaderBoard(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl hover:rotate-90 transition-all duration-300"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                🎮 Select Game:
                            </label>
                            <select
                                value={selectedGame}
                                onChange={(e) => setSelectedGame(e.target.value)}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white shadow-lg transition-all duration-300 font-medium"
                            >
                                <option value="all">🌟 All Games</option>
                                {games.map(game => (
                                    <option key={game.name} value={game.name}>
                                        {game.icon} {game.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-white font-bold text-sm uppercase tracking-wide">🏅 Rank</div>
                                    <div className="text-white font-bold text-sm uppercase tracking-wide">👤 Player</div>
                                    <div className="text-white font-bold text-sm uppercase tracking-wide">🎯 Games</div>
                                    <div className="text-white font-bold text-sm uppercase tracking-wide">⭐ Score</div>
                                </div>
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                                {getFilteredLeaderboard().map((entry, index) => (
                                    <div
                                        key={entry.player}
                                        className={`grid grid-cols-4 gap-4 p-4 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-b border-gray-100 last:border-b-0 ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' :
                                            index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100' :
                                                index === 2 ? 'bg-gradient-to-r from-orange-50 to-yellow-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`text-xl font-bold mr-2 ${index === 0 ? 'text-yellow-500' :
                                                index === 1 ? 'text-gray-500' :
                                                    index === 2 ? 'text-orange-500' : 'text-blue-600'
                                                }`}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-lg font-bold text-gray-800 flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-2 text-sm">
                                                    {entry.player.charAt(0)}
                                                </div>
                                                <span className="truncate">{entry.player}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-lg font-semibold text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
                                                {entry.totalGames}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-lg font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                                                {entry.totalScore.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {getFilteredLeaderboard().length === 0 && (
                                    <div className="p-8 text-center">
                                        <div className="text-4xl mb-3">🎮</div>
                                        <div className="text-lg text-gray-500 font-medium">
                                            No scores available for this game yet.
                                        </div>
                                        <div className="text-gray-400 mt-1 text-sm">
                                            Be the first to play and set a record!
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <div className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg text-sm">
                                <span className="mr-2">🎯</span>
                                Total Players: {getFilteredLeaderboard().length}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}