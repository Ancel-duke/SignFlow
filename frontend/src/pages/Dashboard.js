import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import TranslationTimeline from '../components/TranslationTimeline';
import AISuggestions from '../components/AISuggestions';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const COLORS = ['#5B7FA6', '#8B9BA8', '#27AE60', '#F39C12', '#E74C3C'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleTimelinePreview = (translation) => {
    // Navigate to home with translation pre-filled
    navigate('/', { state: { previewTranslation: translation } });
  };

  const handleAISuggestion = (suggestion) => {
    // Navigate to home with suggestion pre-filled
    navigate('/', { state: { suggestedText: suggestion } });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/users/stats`),
        axios.get(`${API_URL}/analytics/dashboard`)
      ]);

      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  // Prepare chart data
  const activityData = analytics?.recentActivity?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    translations: item.translationsCount || 0,
    sessionTime: item.sessionDuration || 0
  })) || [];

  const topPhrasesData = analytics?.topPhrases?.map(item => ({
    name: item._id.length > 20 ? item._id.substring(0, 20) + '...' : item._id,
    value: item.count
  })) || [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back, {user?.username || 'User'}!</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Total Translations</h3>
            <p className="stat-value">{analytics?.totalTranslations || 0}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Favorite Phrases</h3>
            <p className="stat-value">{analytics?.totalFavorites || 0}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Session Time</h3>
            <p className="stat-value">
              {stats?.totalSessionTime 
                ? `${Math.round(stats.totalSessionTime)} min`
                : '0 min'}
            </p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Activity Days</h3>
            <p className="stat-value">
              {analytics?.recentActivity?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h2>Translation Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="translations"
                stroke="#5B7FA6"
                strokeWidth={2}
                name="Translations"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Session Duration</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sessionTime" fill="#8B9BA8" name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Phrases */}
      {topPhrasesData.length > 0 && (
        <div className="chart-card">
          <h2>Most Used Phrases</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topPhrasesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topPhrasesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Translation Timeline */}
      {analytics?.recentTranslations && analytics.recentTranslations.length > 0 && (
        <TranslationTimeline
          translations={analytics.recentTranslations}
          onPreview={handleTimelinePreview}
        />
      )}

      {/* AI Suggestions */}
      <AISuggestions
        onSelectSuggestion={handleAISuggestion}
        userTranslations={analytics?.recentTranslations || []}
      />
    </div>
  );
};

export default Dashboard;
