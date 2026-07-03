import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdDescription, MdFileDownload } from 'react-icons/md';
import { reportsAPI } from '../services/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await reportsAPI.getAll();
        setReports(data);
      } catch (error) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="topbar">
        <h1>Reports</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: 14 }}>{reports.length} reports</span>
          {reports.length > 0 && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={async () => {
                try {
                  const { data } = await reportsAPI.exportCSV();
                  const url = window.URL.createObjectURL(new Blob([data]));
                  const a = document.createElement('a'); a.href = url; a.download = 'reports.csv'; a.click();
                  window.URL.revokeObjectURL(url);
                  toast.success('CSV downloaded');
                } catch { toast.error('Export failed'); }
              }}><MdFileDownload /> CSV</button>
              <button className="btn btn-secondary btn-sm" onClick={async () => {
                try {
                  const { data } = await reportsAPI.exportPDF();
                  const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
                  const a = document.createElement('a'); a.href = url; a.download = 'reports.pdf'; a.click();
                  window.URL.revokeObjectURL(url);
                  toast.success('PDF downloaded');
                } catch { toast.error('Export failed'); }
              }}><MdFileDownload /> PDF</button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Type</th>
                <th>Period</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>Spend</th>
                <th>CTR</th>
                <th>Generated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <MdDescription size={48} />
                      <h3>No reports yet</h3>
                      <p>Reports are auto-generated daily and weekly for active accounts</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{r.account?.accountName || '-'}</td>
                    <td><span className={`badge badge-${r.reportType === 'daily' ? 'created' : 'active'}`}>{r.reportType}</span></td>
                    <td>{new Date(r.dateFrom).toLocaleDateString()} - {new Date(r.dateTo).toLocaleDateString()}</td>
                    <td>{r.metrics.totalImpressions.toLocaleString()}</td>
                    <td>{r.metrics.totalClicks.toLocaleString()}</td>
                    <td>${r.metrics.totalSpend.toFixed(2)}</td>
                    <td>{r.metrics.avgCtr.toFixed(2)}%</td>
                    <td>
                      <div>{r.generatedBy}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
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

export default Reports;
