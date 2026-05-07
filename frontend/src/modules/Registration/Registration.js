import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const DEPARTMENTS = ['Cardiology','Pediatrics','Orthopedics','Neurology','Emergency','Oncology'];
const STATUSES    = ['Outpatient','Admitted','Discharged'];

const INIT_PATIENTS = [
  { id:'P-001', name:'Victoria Nguyen',   dob:'1985-03-12', dept:'Cardiology',  status:'Admitted',   insurance:'BlueCross' },
  { id:'P-002', name:'Harold Bennett',    dob:'1972-07-28', dept:'Pediatrics',  status:'Outpatient', insurance:'Aetna'     },
  { id:'P-003', name:'Camille Fontaine',  dob:'1990-11-04', dept:'Neurology',   status:'Discharged', insurance:'UHC'       },
  { id:'P-004', name:'Derrick Lawson',    dob:'2001-02-19', dept:'Emergency',   status:'Admitted',   insurance:'Medicaid'  },
  { id:'P-005', name:'Ingrid Castellano', dob:'1968-09-30', dept:'Oncology',    status:'Outpatient', insurance:'Cigna'     },
];

const EMPTY = { name:'', dob:'', dept:'', status:'Outpatient', insurance:'' };

export default function Registration() {
  const { user } = useAuth();

  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('mc_patients');
    return saved ? JSON.parse(saved) : INIT_PATIENTS;
  });

  const [form, setForm]                 = useState(EMPTY);
  const [submitting, setSubmitting]     = useState(false);
  const [successMsg, setSuccessMsg]     = useState('');
  const [error, setError]               = useState('');
  const [newPatientId, setNewPatientId] = useState(null);

  useEffect(() => {
    localStorage.setItem('mc_patients', JSON.stringify(patients));
  }, [patients]);

  const canWrite = ['admin','doctor','receptionist'].includes(user?.role);
  const isNurse  = user?.role === 'nurse';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.dob || !form.dept) {
      setError('Name, date of birth, and department are required.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const id = `P-${String(patients.length + 1).padStart(3,'0')}`;
      const newPatient = { id, ...form };
      setPatients(prev => [newPatient, ...prev]);
      setNewPatientId(id);
      setForm(EMPTY);
      setSuccessMsg(`✅ ${form.name} registered as ${id}. Now available in Scheduling and Billing.`);
      setTimeout(() => { setSuccessMsg(''); setNewPatientId(null); }, 6000);
      setSubmitting(false);
    }, 500);
  };

  const statusBadge = (s) =>
    s === 'Admitted'   ? 'badge-danger' :
    s === 'Outpatient' ? 'badge-info'   : 'badge-neutral';

  return (
    <div>
      {isNurse && (
        <div className="alert alert-warning">
          ⚠️ Nurses can view records only. Doctors, receptionists, and admins can register patients.
        </div>
      )}

      <div className="two-col" style={{ alignItems:'start' }}>
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
                    <th>Insurance</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id} style={p.id === newPatientId ? { background:'#ecfdf5' } : {}}>
                      <td className="mono">{p.id}</td>
                      <td>
                        {p.name}
                        {p.id === newPatientId && (
                          <span className="badge badge-success" style={{ marginLeft:6 }}>new</span>
                        )}
                      </td>
                      <td>{p.dept}</td>
                      <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                      <td style={{ fontSize:12, color:'#6b7280' }}>{p.insurance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card card-body" style={{ marginTop:12, fontSize:13, color:'#6b7280' }}>
            <strong style={{ color:'#1a1a2e', display:'block', marginBottom:6 }}>
              ⚠️ System Limitation
            </strong>
            Emergency walk-ins cannot be treated without prior registration. All patients must be
            registered before scheduling or billing can proceed.
          </div>
        </div>

        <div>
          <div className="section-header">
            <span className="section-title">{canWrite ? 'Register New Patient' : 'View Only'}</span>
          </div>
          <div className="card card-body">
            {successMsg && (
              <div className="alert alert-info" style={{ marginBottom:14 }}>{successMsg}</div>
            )}
            {error && (
              <div className="alert" style={{ background:'#fef2f2', color:'#dc2626', marginBottom:14 }}>
                ❌ {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="First and last name"
                    value={form.name}
                    onChange={e => setForm({...form, name:e.target.value})}
                    disabled={!canWrite}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={e => setForm({...form, dob:e.target.value})}
                    disabled={!canWrite}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={form.dept}
                    onChange={e => setForm({...form, dept:e.target.value})}
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
                    onChange={e => setForm({...form, status:e.target.value})}
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
                    onChange={e => setForm({...form, insurance:e.target.value})}
                    disabled={!canWrite}
                  />
                </div>
              </div>
              {canWrite && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ marginTop:14, width:'100%', justifyContent:'center' }}
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
