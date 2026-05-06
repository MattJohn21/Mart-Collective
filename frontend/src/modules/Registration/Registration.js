import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const DEPARTMENTS = ['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'Emergency', 'Oncology'];
const STATUSES    = ['Outpatient', 'Admitted', 'Discharged', 'Emergency'];

const EMPTY_FORM = { name: '', dob: '', dept: '', status: 'Outpatient', insurance: '' };

export default function Registration() {
  const { user } = useAuth();
  const [patients, setPatients]   = useState([]);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError]         = useState('');

  const canWrite = ['admin', 'doctor'].includes(user?.role);
  const isNurse  = user?.role === 'nurse';

  useEffect(() => {
    axios.get('/api/registration')
      .then(res => setPatients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await axios.post('/api/registration', form);
      setPatients(prev => [res.data, ...prev]);
      setForm(EMPTY_FORM);
      setSuccessMsg(`Patient ${res.data.name} registered successfully (${res.data.id})`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading patient records...</div>;

  const statusBadge = (s) =>
    s === 'Admitted' ? 'badge-danger' : s === 'Outpatient' ? 'badge-info' : s === 'Emergency' ? 'badge-danger' : 'badge-neutral';

  return (
    <div>
      {isNurse && (
        <div className="alert alert-warning">
          ⚠️ Nurses can view patient records. Only doctors and administrators can register or edit patients.
        </div>
      )}

      <div className="two-col" style={{ alignItems: 'start' }}>
        {/* Patient List */}
        <div>
          <div className="section-header">
            <span className="section-title">Patient Records</span>
            <span className="badge badge-neutral">{patients.length} total</span>
          </div>
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Dept</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id}>
                      <td className="mono">{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.dept}</td>
                      <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div>
          <div className="section-header">
            <span className="section-title">
              {canWrite ? 'Register New Patient' : 'Registration — View Only'}
            </span>
          </div>
          <div className="card card-body">
            {successMsg && <div className="alert alert-info" style={{ marginBottom: 16 }}>✅ {successMsg}</div>}
            {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>❌ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>First & Last Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    disabled={!canWrite}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={e => setForm({ ...form, dob: e.target.value })}
                    disabled={!canWrite}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={form.dept}
                    onChange={e => setForm({ ...form, dept: e.target.value })}
                    disabled={!canWrite}
                    required
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    disabled={!canWrite}
                  >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label>Insurance Provider</label>
                  <input
                    type="text"
                    placeholder="e.g. BlueCross, Aetna, Medicaid"
                    value={form.insurance}
                    onChange={e => setForm({ ...form, insurance: e.target.value })}
                    disabled={!canWrite}
                  />
                </div>
              </div>

              {canWrite && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
                  disabled={submitting}
                >
                  {submitting ? 'Registering...' : 'Register Patient'}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
