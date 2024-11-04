import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import './leaderboard.css';

const API_URL = 'https://leaderboard-backend-6fr8.onrender.com';

const ScoreSubmissionForm = () => {
  const [playerName, setPlayerName] = useState('');
  const [category, setCategory] = useState('E');
  const [boulderScores, setBoulderScores] = useState(Array(10).fill(0));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const scoreOptions = [0, 5, 10, 15, 20, 25];

  const handleScoreChange = (index, value) => {
    const newScores = [...boulderScores];
    newScores[index] = parseInt(value);
    setBoulderScores(newScores);
  };

  const resetForm = () => {
    setPlayerName('');
    setCategory('E');
    setBoulderScores(Array(10).fill(0));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Submitting to:', `${API_URL}/submit-score`);
      const response = await fetch(`${API_URL}/submit-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName,
          category,
          boulderScores,
          totalScore: boulderScores.reduce((acc, score) => acc + score, 0),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit scores');
      }

      alert('Scores submitted successfully!');
      resetForm();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Submit Scores</h2>
      
      {error && (
        <div className="error-message">
          <X size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="playerName">Player Name</label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
            placeholder="Enter player name"
            className="input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select"
          >
            {['E', 'D', 'C', 'B', 'A', 'JR', 'Open'].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="scores-grid">
          {boulderScores.map((score, index) => (
            <div className="form-group" key={index}>
              <label htmlFor={`boulder-${index}`}>
                Boulder {index + 1}
              </label>
              <select
                id={`boulder-${index}`}
                value={score}
                onChange={(e) => handleScoreChange(index, e.target.value)}
                className="select"
              >
                {scoreOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} points
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="button-group">
          <button
            type="submit"
            className="button button-primary"
            disabled={isSubmitting}
          >
            <Send size={16} className="mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Scores'}
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={resetForm}
          >
            <X size={16} className="mr-2" />
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScoreSubmissionForm;
