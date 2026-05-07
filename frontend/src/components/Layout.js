import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ALL_MODULES = [
  { path: '/',            label: 'Dashboard',    icon: '📊', module: 'dashboard'    },
  { path: '/billing',     label: 'Billing',      icon: '🧾', module: 'billing'      },
  { path: '/hr',          label: 'Human Resources', icon: '👥', module: 'hr'        },
  { path: '/scheduling',  label: 'Scheduling',   icon: '📅', module: 'scheduling'   },
  { path: '/registration',label: 'Registration', icon: '📋', module: 'registration' },
];

const ROLE_LABELS = {
  admin: 'Administrator', doctor: 'Doctor',
  nurse: 'Nurse', hr: 'HR Staff', patient: 'Patient',
};

const PAGE_TITLES = {
  '/':             { title: 'Dashboard',          sub: 'System overview' },
  '/billing':      { title: 'Billing',            sub: 'Invoices & payments' },
  '/hr':           { title: 'Human Resources',    sub: 'Staff directory & payroll' },
  '/scheduling':   { title: 'Scheduling',         sub: 'Appointments & calendar' },
  '/registration': { title: 'Patient Registration', sub: 'Patient intake & records' },
};

export default function Layout() {
  const { user, logout, canAccess } = useAuth();
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || { title: 'Mart Collective', sub: '' };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🏥 MART Collective</h1>
          <span>Healthcare Management System</span>
        </div>

        <nav className="sidebar-nav">
          {ALL_MODULES.map(m => {
            const accessible = m.module === 'dashboard' || canAccess(m.module);
            return (
              <NavLink
                key={m.path}
                to={m.path}
                end={m.path === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''} ${!accessible ? 'disabled' : ''}`
                }
                title={!accessible ? `Not available for ${ROLE_LABELS[user?.role]}` : ''}
              >
                <span className="nav-icon">{m.icon}</span>
                {m.label}
                {!accessible && <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.5 }}>🔒</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="user-card">
            <div className={`user-avatar avatar-${user?.role}`}>{initials}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{ROLE_LABELS[user?.role]}</div>
            </div>
            <button className="logout-btn" onClick={logout} title="Sign out">⏻</button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <div>
            <h2>{page.title}</h2>
            <p>{page.sub}</p>
          </div>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
