import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const MOCK_USERS = {
  'admin@mart-collective.com':        { password: 'admin123',        role: 'admin'        },
  'doctor@mart-collective.com':       { password: 'doctor123',       role: 'doctor'       },
  'nurse@mart-collective.com':        { password: 'nurse123',        role: 'nurse'        },
  'receptionist@mart-collective.com': { password: 'receptionist123', role: 'receptionist' },
  'billing@mart-collective.com':      { password: 'billing123',      role: 'billing'      },
  'hr@mart-collective.com':           { password: 'hr123',           role: 'hr'           },
  'patient@mart-collective.com':      { password: 'patient123',      role: 'patient'      },
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

const ROLE_LABELS = {
  admin: 'Administrator', doctor: 'Doctor', nurse: 'Nurse',
  receptionist: 'Receptionist', billing: 'Billing Staff', hr: 'HR Staff', patient: 'Patient',
};

const DEMO_ACCOUNTS = [
  'admin@mart-collective.com',
  'doctor@mart-collective.com',
  'nurse@mart-collective.com',
  'receptionist@mart-collective.com',
  'billing@mart-collective.com',
  'hr@mart-collective.com',
  'patient@mart-collective.com',
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
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }
      const user = { id: Date.now(), email, role: found.role, name: ROLE_LABELS[found.role] };
      localStorage.setItem('mc_user', JSON.stringify(user));
      localStorage.setItem('mc_permissions', JSON.stringify(PERMISSIONS[found.role]));
      login(user, PERMISSIONS[found.role]);
      setLoading(false);
    }, 500);
  };

  const fillDemo = (email) => {
    setEmail(email);
    setPassword(MOCK_USERS[email].password);
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
          <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="demo-accounts">
          <h3>Demo Accounts — click to fill</h3>
          {DEMO_ACCOUNTS.map(email => (
            <div key={email} className="demo-item" onClick={() => fillDemo(email)}>
              <strong>{ROLE_LABELS[MOCK_USERS[email].role]}</strong>
              <span>{email}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
