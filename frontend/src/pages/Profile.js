import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  useAuth(); // Keep auth context active
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('favorites');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, favoritesRes, translationsRes] = await Promise.all([
        axios.get(`${API_URL}/users/profile`),
        axios.get(`${API_URL}/favorites`),
        axios.get(`${API_URL}/translations?limit=50`)
      ]);

      setProfile(profileRes.data.user);
      setFavorites(favoritesRes.data.favorites);
      setTranslations(translationsRes.data.translations);
      setError(null);
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFavorite = async (id) => {
    try {
      await axios.delete(`${API_URL}/favorites/${id}`);
      setFavorites(favorites.filter(fav => fav._id !== id));
    } catch (err) {
      console.error('Delete favorite error:', err);
    }
  };

  const handleDeleteTranslation = async (id) => {
    try {
      await axios.delete(`${API_URL}/translations/${id}`);
      setTranslations(translations.filter(trans => trans._id !== id));
    } catch (err) {
      console.error('Delete translation error:', err);
    }
  };

  const filteredFavorites = favorites.filter(fav => {
    const matchesSearch = fav.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || fav.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTranslations = translations.filter(trans =>
    trans.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="profile-loading">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>{error}</p>
        <button onClick={fetchProfileData}>Retry</button>
      </div>
    );
  }

  const categories = ['all', 'common', 'greetings', 'questions', 'emergency', 'custom'];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            {profile?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1>{profile?.username || 'User'}</h1>
            <p className="profile-email">{profile?.email || 'Guest User'}</p>
          </div>
        </div>
      </div>

      <div className="profile-tabs" role="tablist">
        <button
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
          role="tab"
          aria-selected={activeTab === 'favorites'}
        >
          Favorites ({favorites.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          role="tab"
          aria-selected={activeTab === 'history'}
        >
          History ({translations.length})
        </button>
      </div>

      <div className="profile-filters">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          aria-label="Search"
        />
        {activeTab === 'favorites' && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
            aria-label="Filter by category"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="profile-content">
        {activeTab === 'favorites' ? (
          <div className="favorites-list">
            {filteredFavorites.length > 0 ? (
              filteredFavorites.map(favorite => (
                <div key={favorite._id} className="favorite-item">
                  <div className="item-content">
                    <p className="item-text">{favorite.text}</p>
                    <div className="item-meta">
                      <span className="item-category">{favorite.category}</span>
                      <span className="item-usage">Used {favorite.usageCount} times</span>
                    </div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteFavorite(favorite._id)}
                    aria-label={`Delete ${favorite.text}`}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className="empty-state">No favorites found</p>
            )}
          </div>
        ) : (
          <div className="translations-list">
            {filteredTranslations.length > 0 ? (
              filteredTranslations.map(translation => (
                <div key={translation._id} className="translation-item">
                  <div className="item-content">
                    <p className="item-text">{translation.text}</p>
                    <span className="item-date">
                      {new Date(translation.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteTranslation(translation._id)}
                    aria-label={`Delete translation: ${translation.text}`}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className="empty-state">No translations found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
