import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { settingsAPI } from '../services/api';
import { MdSettings, MdSave, MdLink, MdCheckCircle, MdError } from 'react-icons/md';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    clientId: '',
    clientSecret: '',
    developerToken: '',
    refreshToken: '',
    managerAccountId: '',
    isConfigured: false,
    hasClientSecret: false,
    hasDeveloperToken: false,
    hasRefreshToken: false,
  });
  const [form, setForm] = useState({
    clientId: '',
    clientSecret: '',
    developerToken: '',
    managerAccountId: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await settingsAPI.get();
      setSettings(data);
      setForm({
        clientId: data.clientId,
        clientSecret: data.hasClientSecret ? data.clientSecret : '',
        developerToken: data.hasDeveloperToken ? data.developerToken : '',
        managerAccountId: data.managerAccountId,
      });
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await settingsAPI.update(form);
      toast.success(data.message);
      fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const { data } = await settingsAPI.getOAuthUrl();
      window.open(data.url, '_blank', 'width=600,height=700');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate auth URL');
    }
  };

  const formatMccId = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="topbar">
        <h1>Google Ads Settings</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {settings.isConfigured ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: 14, fontWeight: 600 }}>
              <MdCheckCircle size={20} /> Connected
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: 14, fontWeight: 600 }}>
              <MdError size={20} /> Not Configured
            </span>
          )}
        </div>
      </div>

      <div className="card" style={{ maxWidth: 700 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div className="stat-icon blue"><MdSettings size={20} /></div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>API Credentials</h3>
            <p style={{ fontSize: 13, color: '#6b7280' }}>Configure your Google Ads API credentials to connect your MCC account</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>OAuth Client ID</label>
            <input
              type="text"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              placeholder="xxxxxxxxxxxx.apps.googleusercontent.com"
            />
          </div>

          <div className="form-group">
            <label>OAuth Client Secret</label>
            <input
              type="password"
              value={form.clientSecret}
              onChange={(e) => setForm({ ...form, clientSecret: e.target.value })}
              placeholder={settings.hasClientSecret ? 'Already saved (enter new value to change)' : 'GOCSPX-xxxxxxxxxx'}
            />
          </div>

          <div className="form-group">
            <label>Developer Token</label>
            <input
              type="password"
              value={form.developerToken}
              onChange={(e) => setForm({ ...form, developerToken: e.target.value })}
              placeholder={settings.hasDeveloperToken ? 'Already saved (enter new value to change)' : 'Your developer token'}
            />
          </div>

          <div className="form-group">
            <label>MCC Manager Account ID</label>
            <input
              type="text"
              value={form.managerAccountId}
              onChange={(e) => setForm({ ...form, managerAccountId: formatMccId(e.target.value) })}
              placeholder="xxx-xxx-xxxx"
              maxLength={12}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <MdSave size={18} />
              {saving ? 'Saving...' : 'Save Credentials'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ maxWidth: 700, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="stat-icon green"><MdLink size={20} /></div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Google Account Connection</h3>
            <p style={{ fontSize: 13, color: '#6b7280' }}>Generate a refresh token by connecting your Google account</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            className="btn btn-primary"
            onClick={handleConnectGoogle}
            disabled={!form.clientId}
          >
            <MdLink size={18} />
            {settings.hasRefreshToken ? 'Reconnect Google Account' : 'Connect Google Account'}
          </button>

          {settings.hasRefreshToken && (
            <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 500 }}>
              Refresh token saved
            </span>
          )}
        </div>

        {!form.clientId && (
          <p style={{ fontSize: 13, color: '#f59e0b', marginTop: 12 }}>
            Save Client ID and Client Secret first before connecting.
          </p>
        )}
      </div>

      <div className="card" style={{ maxWidth: 700, marginTop: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Setup Guide</h3>
        <ol style={{ fontSize: 14, color: '#4b5563', lineHeight: 2, paddingLeft: 20 }}>
          <li>Go to Google Cloud Console and create an OAuth 2.0 Client ID</li>
          <li>Copy the Client ID and Client Secret here</li>
          <li>Get your Developer Token from Google Ads API Center</li>
          <li>Enter your MCC Manager Account ID (from Google Ads)</li>
          <li>Click "Save Credentials"</li>
          <li>Click "Connect Google Account" to generate a refresh token</li>
          <li>After authorization, you're ready to create accounts!</li>
        </ol>
      </div>
    </div>
  );
};

export default Settings;
