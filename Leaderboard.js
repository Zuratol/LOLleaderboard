import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Trash2, RefreshCw, Download, X, ChartIcon, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './leaderboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://leaderboard-backend-6fr8.onrender.com';
console.log('API URL being used:', API_URL);

const PerformanceChart = ({ data }) => {
  const chartData = data.reduce((acc, score) => {
    const date = new Date(score.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = {
        date,
        averageScore: score.totalScore,
        count: 1
      };
    } else {
      acc[date].averageScore += score.totalScore;
      acc[date].count += 1;
    }
    return acc;
  }, {});

  const formattedData = Object.values(chartData).map(item => ({
    ...item,
    averageScore: Math.round(item.averageScore / item.count)
  }));

  return (
    <div className="chart-container">
      <h3>Performance Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="averageScore" stroke="#8B5CF6" name="Average Score" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const PlayerModal = ({ player, onClose, playerHistory }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        <h3>{player.playerName}'s Progress</h3>
        <div className="player-stats">
          <div>Category: {player.category}</div>
          <div>Best Score: {Math.max(...playerHistory.map(h => h.totalScore))}</div>
          <div>Average Score: {Math.round(playerHistory.reduce((acc, h) => acc + h.totalScore, 0) / playerHistory.length)}</div>
        </div>
        <div className="score-history">
          {playerHistory.map((score, index) => (
            <div key={index} className="score-entry">
              <span>{new Date(score.timestamp).toLocaleDateString()}</span>
              <span>{score.totalScore}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerHistory, setPlayerHistory] = useState([]);
  const [showChart, setShowChart] = useState(false);

  const categories = ['All', 'E', 'D', 'C', 'B', 'A', 'JR', 'Open'];
  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/leaderboard?timeframe=${selectedTimeframe}`;
      console.log('Fetching from:', url);
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      console.log('Received data:', data);
      setLeaderboard(data);
    } catch (error) {
      setError('Failed to load leaderboard data');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlayerHistory = async (playerName) => {
    try {
      const response = await fetch(`${API_URL}/player/${playerName}/history`);
      if (!response.ok) throw new Error('Failed to fetch player history');
      const data = await response.json();
      setPlayerHistory(data);
    } catch (error) {
      console.error('Error fetching player history:', error);
    }
  };

  const deleteScore = async (id) => {
    if (!window.confirm('Are you sure you want to delete this score?')) return;
    
    try {
      const response = await fetch(`${API_URL}/leaderboard/player/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete score');
      await fetchLeaderboard(); // Refresh leaderboard
    } catch (error) {
      setError('Failed to delete score');
      console.error('Error:', error);
    }
  };

  const exportLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/export/leaderboard`);
      const data = await response.json();
      
      const csvContent = [
        ['Player', 'Category', 'Score', 'Date', 'Boulder Scores'].join(','),
        ...data.map(row => [
          row.playerName,
          row.category,
          row.totalScore,
          row.date,
          row.boulderScores
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leaderboard_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting leaderboard:', error);
      setError('Failed to export leaderboard');
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedTimeframe]);

  const getPositionIcon = (position) => {
    switch (position) {
      case 0: return <Trophy className="trophy-gold" size={20} />;
      case 1: return <Medal className="trophy-silver" size={20} />;
      case 2: return <Award className="trophy-bronze" size={20} />;
      default: return null;
    }
  };

  const filteredLeaderboard = selectedCategory === 'All'
    ? leaderboard
    : leaderboard.filter(player => player.category === selectedCategory);

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="error-message">
          {error}
          <button className="button button-primary" onClick={fetchLeaderboard}>
            <RefreshCw size={16} className="mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h2>Leaderboard</h2>

      <div className="controls-section">
        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="timeframe-filter">Timeframe:</label>
          <select
            id="timeframe-filter"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
          >
            {timeframes.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
        </div>

        <button className="button button-secondary" onClick={() => setShowChart(!showChart)}>
          <ChartIcon size={16} className="mr-2" />
          {showChart ? 'Hide Chart' : 'Show Chart'}
        </button>

        <button className="button button-secondary" onClick={exportLeaderboard}>
          <Download size={16} className="mr-2" />
          Export
        </button>

        <button className="button button-danger" onClick={() => clearLeaderboard()}>
          <Trash2 size={16} className="mr-2" />
          Clear
        </button>
      </div>

      {showChart && <PerformanceChart data={leaderboard} />}

      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Category</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaderboard.map((player, index) => (
                <tr key={player.id || index}>
                  <td>
                    <div className={`position position-${index + 1}`}>
                      {getPositionIcon(index)}
                      #{index + 1}
                    </div>
                  </td>
                  <td>
                    <button 
                      className="player-name-button"
                      onClick={() => {
                        setSelectedPlayer(player);
                        fetchPlayerHistory(player.playerName);
                      }}
                    >
                      {player.playerName}
                    </button>
                  </td>
                  <td>
                    <span className="category-badge">
                      {player.category}
                    </span>
                  </td>
                  <td className="score">{player.totalScore}</td>
                  <td>
                    <button
                      className="button button-danger button-small"
                      onClick={() => deleteScore(player.id)}
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          playerHistory={playerHistory}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};

export default Leaderboard;
