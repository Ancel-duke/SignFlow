import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { highContrast, fontSize, toggleHighContrast, changeFontSize } = useAccessibility();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMenu(false);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" aria-label="SignFlow Home">
          <span className="brand-icon">👋</span>
          <span className="brand-text">SignFlow</span>
        </Link>

        <div className="navbar-actions">
          {/* Accessibility Controls */}
          <div className="accessibility-menu">
            <button
              className="accessibility-toggle"
              onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
              aria-label="Accessibility options"
              aria-expanded={showAccessibilityMenu}
            >
              <span aria-hidden="true">♿</span>
            </button>
            {showAccessibilityMenu && (
              <div className="accessibility-dropdown" role="menu">
                <button
                  className="accessibility-option"
                  onClick={toggleHighContrast}
                  role="menuitemcheckbox"
                  aria-checked={highContrast}
                >
                  {highContrast ? '✓' : ''} High Contrast
                </button>
                <div className="font-size-controls" role="group" aria-label="Font size">
                  <button
                    className={`font-size-btn ${fontSize === 'small' ? 'active' : ''}`}
                    onClick={() => changeFontSize('small')}
                    aria-label="Small font size"
                  >
                    A
                  </button>
                  <button
                    className={`font-size-btn ${fontSize === 'medium' ? 'active' : ''}`}
                    onClick={() => changeFontSize('medium')}
                    aria-label="Medium font size"
                  >
                    A
                  </button>
                  <button
                    className={`font-size-btn ${fontSize === 'large' ? 'active' : ''}`}
                    onClick={() => changeFontSize('large')}
                    aria-label="Large font size"
                  >
                    A
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          {user ? (
            <div className="user-menu">
              <button
                className="user-toggle"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="User menu"
                aria-expanded={showMenu}
              >
                <span className="user-avatar">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="user-name">{user.username || 'User'}</span>
              </button>
              {showMenu && (
                <div className="user-dropdown" role="menu">
                  <Link
                    to="/dashboard"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => setShowMenu(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => setShowMenu(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/" className="login-link">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
