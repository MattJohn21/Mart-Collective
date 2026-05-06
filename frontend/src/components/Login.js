import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const MOCK_USERS = {
  'admin@mart-collective.com':        { password: 'admin123',        name: 'Dr. Evelyn Carter',   role: 'admin'        },
  'doctor@mart-collective.com':       { password: 'doctor123',       name: 'Dr. Marcus Williams', role: 'doctor'       },
  'nurse@mart-collective.com':        { password: 'nurse123',        name: 'Natalie Osei',        role: 'nurse'        },
  'receptionist@mart-collective.com': { password: 'receptionist123', name: 'Jordan Hargrove',     role: 'receptionist' },
  'billing@mart-collective.com':      { password: 'billing123',      name: 'Simone Caldwell',     role: 'billing'      },
  'hr@mart-collective.com':           { password: 'hr123',           name: 'Raymond Ellison',     role: 'hr'           },
  'patient@mart-collective.com':      { password: 'patient123',      name: 'Victoria Nguyen',     role: 'patient'      },
};

const PERMISSIONS = {
  admin:        { modules: ['dashboard','billing','hr','scheduling','registration'], billing: ['read','write','delete'], hr: ['read','write','delete','view_salary'], scheduling: ['read','write','delete'], registration: ['read','write','delete'] },
  doctor:       { modules: ['dashboard','scheduling','registration'], scheduling: ['read','write'], registration: ['read','write'] },
  nurse:        { modules: ['dashboard','scheduling','registration'], scheduling: ['read'], registration: ['read'] },
  receptionist: { modules: ['dashboard','scheduling','registration'], scheduling: ['read','write'], registration: ['read','write'] },
  billing:      { modules: ['dashboard','billing'], billing: ['read','write'] },
  hr:           { modules: ['dashboard','hr'], hr: ['read','write'] },
  patient:      { modules: ['dashboard','billing','scheduling'], billing: ['read_own'], scheduling: ['read_own','request'] },
};

const DEMO_ACCOUNTS = [
  { email: 'admin@mart-collective.com',        role: 'Administrator' },
  { email: 'doctor@mart-collective.com',       role: 'Doctor'        },
  { email: 'nurse@mart-collective.com',        role: 'Nurse'         },
  { email: 'receptionist@mart-collective.com', role: 'Receptionist'  },
  { email: 'billing@mart-collective.com',      role: 'Billing Staff' },
  { email: 'hr@mart-collective.com',           role: 'HR Staff'      },
  { email: 'patient@mart-collective.com',      role: 'Patient'       },
];

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const found = MOCK_USERS[email.toLowerCase().trim()];
      if (!found || found.password !== password) {
        setError('Invalid credentials. Click a demo account below to fill in.');
        setLoading(false);
        return;
      }
      const user = { id: Date.now(), name: found.name, email, role: found.role };
      const permissions = PERMISSIONS[found.role];
      localStorage.setItem('mc_user', JSON.stringify(user));
      localStorage.setItem('mc_permissions', JSON.stringify(permissions));
      login(user, permissions);
      setLoading(false);
    }, 500);
  };

  const fillDemo = (account) => {
    const found = MOCK_USERS[account.email];
    setEmail(account.email);
    setPassword(found.password);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>🏥 Mart Collective HMS</h1>
        <p>Integrated Healthcare Management — Sign in to continue</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@mart-collective.com" required />
          </div>
          <div className="form-group mb-5">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="demo-accounts">
          <h3>Demo Accounts — click to fill</h3>
          {DEMO_ACCOUNTS.map(a => (
            <div key={a.role} className="demo-item" onClick={() => fillDemo(a)}>
              <strong>{a.role}</strong>
              <span>{MOCK_USERS[a.email].name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
