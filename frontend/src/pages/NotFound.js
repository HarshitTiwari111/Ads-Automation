import React from 'react';
import { Link } from 'react-router-dom';
import { MdHome, MdSearchOff } from 'react-icons/md';

const NotFound = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
    <MdSearchOff size={64} color="#d1d5db" />
    <h1 style={{ fontSize: 72, fontWeight: 800, color: '#e5e7eb', margin: '8px 0' }}>404</h1>
    <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Page Not Found</h2>
    <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>The page you're looking for doesn't exist or has been moved.</p>
    <Link to="/" className="btn btn-primary"><MdHome /> Go to Dashboard</Link>
  </div>
);

export default NotFound;
