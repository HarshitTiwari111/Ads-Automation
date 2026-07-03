import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { performanceAPI } from '../services/api';

const PerformancePage = () => {
  const [data, setData] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: perfData } = await performanceAPI.getOverall({ days });
        setData(perfData);
      } catch (error) {
        toast.error('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [days]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const totalImpressions = data.reduce((sum, d) => sum + d.impressions, 0);
  const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
  const totalSpend = data.reduce((sum, d) => sum + d.spend, 0);

  return (
    <div>
      <div className="topbar">
        <h1>Performance Overview</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {[7, 14, 30].map((d) => (
            <button key={d} className={`btn ${days === d ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setDays(d)}>
              {d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Impressions</div>
          <div className="stat-value">{totalImpressions.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Clicks</div>
          <div className="stat-value">{totalClicks.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Spend</div>
          <div className="stat-value">${totalSpend.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg CTR</div>
          <div className="stat-value">{totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'}%</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Daily Breakdown</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="impressions" fill="#4fc3f7" name="Impressions" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clicks" fill="#66bb6a" name="Clicks" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            <h3>No performance data available</h3>
            <p>Performance data will be populated once campaigns start running</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformancePage;
