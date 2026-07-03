import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdArrowBack, MdSync } from 'react-icons/md';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { accountsAPI, campaignsAPI, performanceAPI, reportsAPI } from '../services/api';

const AccountDetail = () => {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    try {
      const [accRes, campRes, perfRes, sumRes, repRes] = await Promise.all([
        accountsAPI.get(id),
        campaignsAPI.getByAccount(id),
        performanceAPI.getByAccount(id),
        performanceAPI.getSummary(id),
        reportsAPI.getByAccount(id),
      ]);
      setAccount(accRes.data);
      setCampaigns(campRes.data);
      setPerformance(perfRes.data);
      setSummary(sumRes.data);
      setReports(repRes.data);
    } catch (error) {
      const msg = error.response?.status === 500
        ? 'Server error — database connection may be down. Try again in a moment.'
        : error.response?.status === 404
          ? 'Account not found'
          : 'Failed to load account details';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await accountsAPI.sync(id);
      toast.success('Performance data synced!');
      await fetchData();
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!account) return <div className="empty-state"><h3>Account not found</h3></div>;

  return (
    <div>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/accounts" className="btn btn-secondary btn-sm"><MdArrowBack /></Link>
          <h1>{account.accountName}</h1>
          <span className={`badge badge-${account.status}`}>{account.status}</span>
        </div>
        <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
          <MdSync size={18} style={syncing ? { animation: 'spin 1s linear infinite' } : {}} />
          {syncing ? 'Syncing...' : 'Sync Data'}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Impressions</div>
          <div className="stat-value">{summary?.totalImpressions?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Clicks</div>
          <div className="stat-value">{summary?.totalClicks?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Spend</div>
          <div className="stat-value">${summary?.totalSpend?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg CTR</div>
          <div className="stat-value">{summary?.avgCtr?.toFixed(2) || '0.00'}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Account Info</h3>
          <table>
            <tbody>
              <tr><td style={{ fontWeight: 600 }}>Client</td><td>{account.clientName}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Email</td><td>{account.clientEmail}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Industry</td><td>{account.industry || '-'}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Website</td><td>{account.website || '-'}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Google Ads ID</td><td style={{ fontFamily: 'monospace' }}>{account.googleAdsCustomerId || '-'}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Warmup Started</td><td>{account.warmupStartDate ? new Date(account.warmupStartDate).toLocaleDateString() : '-'}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Campaigns ({campaigns.length})</h3>
          {campaigns.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>No campaigns yet</p>
          ) : (
            <table>
              <thead><tr><th>Name</th><th>Type</th><th>Budget</th><th>Status</th></tr></thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c._id}>
                    <td>{c.campaignName}</td>
                    <td>{c.campaignType}</td>
                    <td>${c.dailyBudget}/day</td>
                    <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>Performance Trend</h3>
        {performance.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[...performance].reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
              <Line type="monotone" dataKey="impressions" stroke="#4fc3f7" strokeWidth={2} />
              <Line type="monotone" dataKey="clicks" stroke="#66bb6a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No performance data available</p>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Reports ({reports.length})</h3>
        {reports.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No reports generated yet</p>
        ) : (
          <table>
            <thead><tr><th>Type</th><th>Period</th><th>Impressions</th><th>Clicks</th><th>Spend</th><th>Status</th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td>{r.reportType}</td>
                  <td>{new Date(r.dateFrom).toLocaleDateString()} - {new Date(r.dateTo).toLocaleDateString()}</td>
                  <td>{r.metrics.totalImpressions.toLocaleString()}</td>
                  <td>{r.metrics.totalClicks.toLocaleString()}</td>
                  <td>${r.metrics.totalSpend.toFixed(2)}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AccountDetail;
