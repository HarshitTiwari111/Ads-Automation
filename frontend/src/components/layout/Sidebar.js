import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MdDashboard,
  MdPeople,
  MdCampaign,
  MdBarChart,
  MdDescription,
  MdSettings,
  MdLogout,
  MdPerson,
  MdDarkMode,
  MdLightMode,
} from 'react-icons/md';

const Sidebar = () => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <MdDashboard /> },
    { path: '/accounts', label: 'Accounts', icon: <MdPeople /> },
    { path: '/campaigns', label: 'Campaigns', icon: <MdCampaign /> },
    { path: '/performance', label: 'Performance', icon: <MdBarChart /> },
    { path: '/reports', label: 'Reports', icon: <MdDescription /> },
    { path: '/profile', label: 'Profile', icon: <MdPerson /> },
    { path: '/settings', label: 'Settings', icon: <MdSettings /> },
  ];

  return (
    <>
    <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
      &#9776;
    </button>
    {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
    <div className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-logo">
        <MdCampaign size={28} />
        <span>Ads</span> Automation
      </div>

      <ul className="sidebar-nav">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => (isActive ? 'active' : '')}
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', position: 'absolute', bottom: 24, left: 16, right: 16 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8, padding: '0 8px' }}>
          {user?.name}
        </div>
        <button
          onClick={toggleDarkMode}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer', fontSize: 14, fontWeight: 500, width: '100%', borderRadius: 8,
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
        >
          {darkMode ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer', fontSize: 14, fontWeight: 500, width: '100%', borderRadius: 8,
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
        >
          <MdLogout size={18} />
          Logout
        </button>
      </div>
    </div>
    </>
  );
};

export default Sidebar;
