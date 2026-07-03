import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdAdd, MdSearch, MdDelete, MdVisibility, MdEdit } from 'react-icons/md';
import { accountsAPI } from '../services/api';

const emptyForm = { accountName: '', clientName: '', clientEmail: '', industry: '', website: '' };

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchAccounts = async () => {
    try {
      const { data } = await accountsAPI.getAll({ search });
      setAccounts(data);
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, [search]);

  const openCreate = () => {
    setEditingAccount(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (acc) => {
    setEditingAccount(acc);
    setForm({
      accountName: acc.accountName,
      clientName: acc.clientName,
      clientEmail: acc.clientEmail,
      industry: acc.industry || '',
      website: acc.website || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await accountsAPI.update(editingAccount._id, form);
        toast.success('Account updated!');
      } else {
        await accountsAPI.create(form);
        toast.success('Account created! Warm-up campaign will be set up automatically.');
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingAccount(null);
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingAccount ? 'update' : 'create'} account`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await accountsAPI.delete(id);
      toast.success('Account deleted');
      fetchAccounts();
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="topbar">
        <h1>Accounts</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <MdAdd /> New Account
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span style={{ color: '#6b7280', fontSize: 14 }}>{accounts.length} accounts</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Client</th>
                <th>Industry</th>
                <th>Status</th>
                <th>Google Ads ID</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No accounts found</td></tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc._id}>
                    <td style={{ fontWeight: 600 }}>{acc.accountName}</td>
                    <td>
                      <div>{acc.clientName}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{acc.clientEmail}</div>
                    </td>
                    <td>{acc.industry || '-'}</td>
                    <td><span className={`badge badge-${acc.status}`}>{acc.status}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{acc.googleAdsCustomerId || '-'}</td>
                    <td>{new Date(acc.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/accounts/${acc._id}`} className="btn btn-secondary btn-sm"><MdVisibility /></Link>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(acc)}><MdEdit /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(acc._id)}><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingAccount(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingAccount ? 'Edit Account' : 'Create New Account'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Account Name *</label>
                <input type="text" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} required placeholder="e.g. Client XYZ Google Ads" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Client Name *</label>
                  <input type="text" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Client Email *</label>
                  <input type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Industry</label>
                  <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. E-commerce" />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingAccount(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingAccount ? 'Save Changes' : 'Create & Setup'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
