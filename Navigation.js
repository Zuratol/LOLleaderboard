import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './leaderboard.css';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="nav-container">
      <h1 className="nav-title">League of Legends</h1>
      <div className="nav-links">
        <Link 
          to="/leaderboard" 
          className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}
        >
          View Leaderboard
        </Link>
        <Link 
          to="/submit" 
          className={`nav-link ${location.pathname === '/submit' ? 'active' : ''}`}
        >
          Submit Scores
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;