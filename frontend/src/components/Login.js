import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'https://mart-collective.onrender.com';

const DEMO_ACCOUNTS = [
  { email: 'admin@mart-collective.com',        password: 'admin123',       role: 'Administrator' },
  { email: 'doctor@mart-collective.com',       password: 'doctor123',      role: 'Doctor'        },
  { email: 'nurse@mart-collective.com',        password: 'nurse123',       role: 'Nurse'         },
  { email: 'receptionist@mart-collective.com', password: 'receptionist123',role: 'Receptionist'  },
  { email: 'billing@mart-collective.com',      password: 'billing123',     role: 'Billing Staff' },
  { email: 'hr@mart-collective.com',           password: 'hr123',          role: 'HR Staff'      },
  { email: 'patient@mart-collective.com',      password: 'patient123',     role: 'Patient'       },
];

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      const { token, user, permissions } = res.data;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('mc_token', token);
      localStorage.setItem('mc_user', JSON.stringify(user));
      localStorage.setItem('mc_permissions', JSON.stringify(permissions));
      login(user, permissions);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Try a demo account below.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
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
              <span>{a.email}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
