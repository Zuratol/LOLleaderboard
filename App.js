import React, { useState } from 'react';
import Leaderboard from './Leaderboard';
import SubmitScores from './SubmitScore';
import './leaderboard.css';

const App = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  return (
    <div className="page-container">
      {/* Navigation Section */}
      <nav className="nav-container">
        <h1 className="nav-title">League of Legends</h1>
        <div className="nav-links">
          <button 
            onClick={() => setShowLeaderboard(true)}
            className={`nav-link ${showLeaderboard ? 'active' : ''}`}
          >
            View Leaderboard
          </button>
          <button 
            onClick={() => setShowLeaderboard(false)}
            className={`nav-link ${!showLeaderboard ? 'active' : ''}`}
          >
            Submit Scores
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {showLeaderboard ? <Leaderboard /> : <SubmitScores />}
      </main>
    </div>
  );
};

export default App;