import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SNIPPETS } from './CodeVault';
import './index.css';

const BlackScreen: React.FC = () => {
  return <div className="black-screen" />;
};

const HomePage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPassDropdown, setShowPassDropdown] = useState(false);

  useEffect(() => {
    document.title = "IIITKottayam Authentication";
  }, []);

  const handleContinue = () => {
    if (username && password) {
      const codeKey = `${username}/${password}`;
      const code = SNIPPETS[codeKey];
      if (code) {
        // Silently copy to clipboard
        navigator.clipboard.writeText(code).catch(() => {
          // Fallback if needed, but the user wants silent
        });
      }
    }
  };

  const handleSelectUser = (val: string) => {
    setUsername(val);
    setShowUserDropdown(false);
  };

  const handleSelectPass = (val: string) => {
    setPassword(val);
    setShowPassDropdown(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* Header section with logo and title */}
        <div className="auth-header">
          <img 
            className="auth-logo" 
            src="https://iiitkottayam.ac.in/data/images/main/logo.jpg" 
            alt="IIIT Kottayam Logo" 
          />
          <div className="auth-title-box">
            <h2>Indian Institute of Information Technology Kottayam</h2>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="welcome-msg">
          <h1>Welcome to IIITKottayam Network</h1>
        </div>

        {/* Info section with horizontal line */}
        <div className="info-section">
          <p className="info-text">Please enter your username and password to continue.</p>

          <div className="input-row">
            <label>Username:</label>
            <input 
              type="text" 
              value={username} 
              readOnly 
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowPassDropdown(false);
              }}
              placeholder=""
            />
            {showUserDropdown && (
              <ul className="custom-dropdown">
                {["1", "2", "3"].map(id => (
                  <li key={id} onClick={() => handleSelectUser(id)}>{id}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="input-row">
            <label>Password:</label>
            <input 
              type="password" 
              value={password} 
              readOnly 
              onClick={() => {
                setShowPassDropdown(!showPassDropdown);
                setShowUserDropdown(false);
              }}
              placeholder=""
            />
            {showPassDropdown && (
              <ul className="custom-dropdown">
                {["1", "2", "3"].map(id => (
                  <li key={id} onClick={() => handleSelectPass(id)}>{id}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="btn-row">
            <button className="btn-continue" onClick={handleContinue}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:p1/:p2" element={<BlackScreen />} />
        <Route path="/:p1/:p2/" element={<BlackScreen />} />
        {/* General catch-all */}
        <Route path="*" element={<BlackScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
