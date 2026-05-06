import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { email: 'admin@medcore.com',   password: 'admin123',   role: 'Administrator' },
  { email: 'doctor@medcore.com',  password: 'doctor123',  role: 'Doctor'        },
  { email: 'nurse@medcore.com',   password: 'nurse123',   role: 'Nurse'         },
  { email: 'hr@medcore.com',      password: 'hr123',      role: 'HR Staff'      },
  { email: 'patient@medcore.com', password: 'patient123', role: 'Patient'       },
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
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
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
        <h1>🏥 MedCore HMS</h1>
        <p>Healthcare Management System — Sign in to continue</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@medcore.com"
              required
            />
          </div>
          <div className="form-group mb-5">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
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
