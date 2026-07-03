import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdCampaign } from 'react-icons/md';
import { campaignsAPI } from '../services/api';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data } = await campaignsAPI.getAll();
        setCampaigns(data);
      } catch (error) {
        toast.error('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="topbar">
        <h1>Campaigns</h1>
        <span style={{ color: '#6b7280', fontSize: 14 }}>{campaigns.length} total campaigns</span>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Account</th>
                <th>Type</th>
                <th>Daily Budget</th>
                <th>Bidding</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <MdCampaign size={48} />
                      <h3>No campaigns yet</h3>
                      <p>Campaigns are auto-created when you set up a new account</p>
                    </div>
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.campaignName}</td>
                    <td>{c.account?.accountName || '-'}</td>
                    <td><span className={`badge badge-${c.campaignType === 'warmup' ? 'warmup' : 'active'}`}>{c.campaignType}</span></td>
                    <td>${c.dailyBudget.toFixed(2)}</td>
                    <td style={{ fontSize: 12 }}>{c.biddingStrategy}</td>
                    <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
