import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdPeople, MdHourglassTop, MdCheckCircle, MdError, MdTrendingUp } from 'react-icons/md';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { accountsAPI, performanceAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, warmup: 0, active: 0, failed: 0 });
  const [perfData, setPerfData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, perfRes] = await Promise.all([
          accountsAPI.getStats(),
          performanceAPI.getOverall({ days: 7 }),
        ]);
        setStats(statsRes.data);
        setPerfData(perfRes.data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="topbar">
        <h1>Dashboard</h1>
        <Link to="/accounts" className="btn btn-primary">+ New Account</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><MdPeople /></div>
          <div className="stat-label">Total Accounts</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><MdHourglassTop /></div>
          <div className="stat-label">Warm-up</div>
          <div className="stat-value">{stats.warmup}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><MdCheckCircle /></div>
          <div className="stat-label">Active</div>
          <div className="stat-value">{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><MdError /></div>
          <div className="stat-label">Failed</div>
          <div className="stat-value">{stats.failed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><MdTrendingUp /></div>
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Performance (Last 7 Days)</h3>
        {perfData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={perfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="impressions" stroke="#4fc3f7" strokeWidth={2} name="Impressions" />
              <Line type="monotone" dataKey="clicks" stroke="#66bb6a" strokeWidth={2} name="Clicks" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            <MdTrendingUp size={48} />
            <h3>No performance data yet</h3>
            <p>Data will appear once campaigns start running</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
