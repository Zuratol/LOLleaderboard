import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Trash2, RefreshCw } from 'lucide-react';
import './leaderboard.css';
import API_URL from './config';  // Import the API URL

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['All', 'E', 'D', 'C', 'B', 'A', 'JR', 'Open'];

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/leaderboard`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`Failed to load leaderboard data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLeaderboard = async () => {
    if (!window.confirm('Are you sure you want to clear the leaderboard?')) return;
    
    try {
      const response = await fetch(`${API_URL}/leaderboard`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to clear leaderboard: ${errorText}`);
      }

      setLeaderboard([]);
    } catch (error) {
      setError(`Failed to clear leaderboard: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getPositionIcon = (position) => {
    switch (position) {
      case 0:
        return <Trophy className="trophy-gold" size={20} />;
      case 1:
        return <Medal className="trophy-silver" size={20} />;
      case 2:
        return <Award className="trophy-bronze" size={20} />;
      default:
        return null;
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

      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <button
          className="button button-danger"
          onClick={clearLeaderboard}
        >
          <Trash2 size={16} className="mr-2" />
          Clear Leaderboard
        </button>
      </div>

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
              </tr>
            </thead>
            <tbody>
              {filteredLeaderboard.map((player, index) => (
                <tr key={index}>
                  <td>
                    <div className={`position position-${index + 1}`}>
                      {getPositionIcon(index)}
                      #{index + 1}
                    </div>
                  </td>
                  <td>{player.playerName}</td>
                  <td>
                    <span className="category-badge">
                      {player.category}
                    </span>
                  </td>
                  <td className="score">{player.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
