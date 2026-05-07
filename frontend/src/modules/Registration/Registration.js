import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const DEPARTMENTS = ['Cardiology','Pediatrics','Orthopedics','Neurology','Emergency','Oncology'];
const STATUSES    = ['Outpatient','Admitted','Discharged'];

const INIT_PATIENTS = [
  { id:'P-001', name:'Victoria Nguyen',   dob:'1985-03-12', dept:'Cardiology',  status:'Admitted',   insurance:'BlueCross', phone:'(404) 555-0192', email:'victoria.nguyen@email.com',  address:'142 Peachtree St, Atlanta, GA', emergency:'James Nguyen — (404) 555-0187', allergies:'Penicillin', notes:'Hypertension managed' },
  { id:'P-002', name:'Harold Bennett',    dob:'1972-07-28', dept:'Pediatrics',  status:'Outpatient', insurance:'Aetna',     phone:'(404) 555-0134', email:'harold.bennett@email.com',   address:'89 Maple Ave, Alpharetta, GA',  emergency:'Susan Bennett — (404) 555-0198', allergies:'None', notes:'' },
  { id:'P-003', name:'Camille Fontaine',  dob:'1990-11-04', dept:'Neurology',   status:'Discharged', insurance:'UHC',       phone:'(678) 555-0211', email:'camille.fontaine@email.com', address:'310 Roswell Rd, Atlanta, GA',   emergency:'Pierre Fontaine — (678) 555-0244', allergies:'Sulfa drugs', notes:'Migraine history' },
  { id:'P-004', name:'Derrick Lawson',    dob:'2001-02-19', dept:'Emergency',   status:'Admitted',   insurance:'Medicaid',  phone:'(770) 555-0178', email:'derrick.lawson@email.com',   address:'55 Oak Lane, Marietta, GA',     emergency:'Patricia Lawson — (770) 555-0165', allergies:'Latex', notes:'' },
  { id:'P-005', name:'Ingrid Castellano', dob:'1968-09-30', dept:'Oncology',    status:'Outpatient', insurance:'Cigna',     phone:'(404) 555-0256', email:'ingrid.castellano@email.com',address:'221 Buckhead Ave, Atlanta, GA', emergency:'Marco Castellano — (404) 555-0231', allergies:'Aspirin', notes:'Chemotherapy cycle 3' },
];

const EMPTY = { name:'', dob:'', dept:'', status:'Outpatient', insurance:'', phone:'', email:'', address:'', emergency:'', allergies:'', notes:'' };

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
  const [editingId, setEditingId]       = useState(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [editingProfile, setEditingProfile]         = useState(false);
  const [profileForm, setProfileForm]               = useState({});

  useEffect(() => {
    localStorage.setItem('mc_patients', JSON.stringify(patients));
  }, [patients]);

  const isPatient  = user?.role === 'patient';
  const canWrite   = ['admin','doctor','receptionist'].includes(user?.role);
  const isNurse    = user?.role === 'nurse';

  const myRecord   = patients.find(p => p.id === 'P-001');

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.dob || !form.dept) {
      setError('Name, date of birth, and department are required.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const id = 'P-' + String(patients.length + 1).padStart(3,'0');
      setPatients(prev => [{ id, ...form }, ...prev]);
      setNewPatientId(id);
      setForm(EMPTY);
      flash('✅ ' + form.name + ' registered as ' + id + '. Now available in Scheduling and Billing.');
      setTimeout(() => setNewPatientId(null), 6000);
      setSubmitting(false);
    }, 500);
  };

  const openProfileEdit = () => {
    setProfileForm({ ...myRecord });
    setEditingProfile(true);
  };

  const saveProfile = (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.phone || !profileForm.email) {
      flash('❌ Name, phone, and email are required.');
      return;
    }
    setPatients(prev => prev.map(p => p.id === 'P-001' ? { ...p, ...profileForm } : p));
    setEditingProfile(false);
    flash('✅ Your profile has been updated successfully.');
  };

  const statusBadge = (s) =>
    s === 'Admitted' ? 'badge-danger' : s === 'Outpatient' ? 'badge-info' : 'badge-neutral';

  if (isPatient) {
    return (
      <div>
        {successMsg && <div className="alert alert-info">{successMsg}</div>}

        <div className="alert alert-info">
          👤 View and update your personal health record below.
        </div>

        {myRecord && !editingProfile && (
          <div>
            <div className="section-header">
              <span className="section-title">Your Personal Record</span>
              <button className="btn btn-primary btn-sm" onClick={openProfileEdit}>
                ✏️ Edit My Information
              </button>
            </div>

            <div className="two-col" style={{ alignItems:'start' }}>
              <div className="card card-body">
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16, paddingBottom:14, borderBottom:'1px solid #f0f1f5' }}>
                  <div style={{ width:52, height:52, borderRadius:'50%', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#3b82f6', flexShrink:0 }}>
                    {myRecord.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:16 }}>{myRecord.name}</div>
                    <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>Patient ID: {myRecord.id}</div>
                    <span className={'badge ' + statusBadge(myRecord.status)} style={{ marginTop:4 }}>{myRecord.status}</span>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, fontSize:13 }}>
                  {[
                    { label:'Date of Birth',  value: myRecord.dob                 },
                    { label:'Department',     value: myRecord.dept                },
                    { label:'Phone',          value: myRecord.phone               },
                    { label:'Email',          value: myRecord.email               },
                    { label:'Insurance',      value: myRecord.insurance           },
                    { label:'Address',        value: myRecord.address             },
                  ].map(r => (
                    <div key={r.label}>
                      <div style={{ fontSize:10, color:'#9ca3af', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>{r.label}</div>
                      <div style={{ fontWeight:500 }}>{r.value || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div className="card card-body">
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>🚨 Emergency Contact</div>
                  <div style={{ fontSize:13, color:'#374151' }}>{myRecord.emergency || '—'}</div>
                </div>
                <div className="card card-body">
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>💊 Allergies</div>
                  <div style={{ fontSize:13, color: myRecord.allergies && myRecord.allergies !== 'None' ? '#dc2626' : '#374151' }}>
                    {myRecord.allergies || 'None recorded'}
                  </div>
                </div>
                {myRecord.notes && (
                  <div className="card card-body">
                    <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>📋 Clinical Notes</div>
                    <div style={{ fontSize:13, color:'#374151' }}>{myRecord.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {editingProfile && (
          <div>
            <div className="section-header">
              <span className="section-title">Edit Your Information</span>
            </div>
            <div className="card card-body">
              <form onSubmit={saveProfile}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={profileForm.name || ''} onChange={e => setProfileForm({...profileForm, name:e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" value={profileForm.dob || ''} onChange={e => setProfileForm({...profileForm, dob:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="(404) 555-0000" value={profileForm.phone || ''} onChange={e => setProfileForm({...profileForm, phone:e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="you@email.com" value={profileForm.email || ''} onChange={e => setProfileForm({...profileForm, email:e.target.value})} required />
                  </div>
                  <div className="form-group full">
                    <label>Home Address</label>
                    <input type="text" placeholder="Street, City, State" value={profileForm.address || ''} onChange={e => setProfileForm({...profileForm, address:e.target.value})} />
                  </div>
                  <div className="form-group full">
                    <label>Emergency Contact</label>
                    <input type="text" placeholder="Name — Phone number" value={profileForm.emergency || ''} onChange={e => setProfileForm({...profileForm, emergency:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Insurance Provider</label>
                    <input type="text" placeholder="e.g. BlueCross, Aetna" value={profileForm.insurance || ''} onChange={e => setProfileForm({...profileForm, insurance:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Known Allergies</label>
                    <input type="text" placeholder="e.g. Penicillin, Latex, None" value={profileForm.allergies || ''} onChange={e => setProfileForm({...profileForm, allergies:e.target.value})} />
                  </div>
                </div>

                <div style={{ marginTop:8, padding:'10px 12px', background:'#fffbeb', borderRadius:8, fontSize:12, color:'#d97706' }}>
                  ⚠️ Clinical notes and department can only be updated by your care team.
                </div>

                <div style={{ display:'flex', gap:8, marginTop:14 }}>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  <button type="button" className="btn" onClick={() => setEditingProfile(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {isNurse && (
        <div className="alert alert-warning">
          ⚠️ Nurses can view records only. Doctors, receptionists, and admins can register or edit patients.
        </div>
      )}
      {successMsg && <div className="alert alert-info">{successMsg}</div>}

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
                  <tr><th>ID</th><th>Name</th><th>Dept</th><th>Status</th><th>Insurance</th></tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id} style={p.id === newPatientId ? { background:'#ecfdf5' } : {}}>
                      <td className="mono">{p.id}</td>
                      <td>
                        {p.name}
                        {p.id === newPatientId && <span className="badge badge-success" style={{ marginLeft:6 }}>new</span>}
                      </td>
                      <td>{p.dept}</td>
                      <td><span className={'badge ' + statusBadge(p.status)}>{p.status}</span></td>
                      <td style={{ fontSize:12, color:'#6b7280' }}>{p.insurance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card card-body" style={{ marginTop:12, fontSize:13, color:'#6b7280' }}>
            <strong style={{ color:'#1a1a2e', display:'block', marginBottom:6 }}>⚠️ System Limitation</strong>
            Emergency walk-ins cannot be treated without prior registration. All patients must be registered before scheduling or billing can proceed.
          </div>
        </div>

        <div>
          <div className="section-header">
            <span className="section-title">{canWrite ? 'Register New Patient' : 'View Only'}</span>
          </div>
          <div className="card card-body">
            {error && <div className="alert" style={{ background:'#fef2f2', color:'#dc2626', marginBottom:14 }}>❌ {error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="First and last name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} disabled={!canWrite} required />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" value={form.dob} onChange={e => setForm({...form, dob:e.target.value})} disabled={!canWrite} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" placeholder="(404) 555-0000" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} disabled={!canWrite} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="patient@email.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} disabled={!canWrite} />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select value={form.dept} onChange={e => setForm({...form, dept:e.target.value})} disabled={!canWrite} required>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status:e.target.value})} disabled={!canWrite}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label>Insurance Provider</label>
                  <input type="text" placeholder="e.g. BlueCross, Aetna, Medicaid" value={form.insurance} onChange={e => setForm({...form, insurance:e.target.value})} disabled={!canWrite} />
                </div>
                <div className="form-group full">
                  <label>Address</label>
                  <input type="text" placeholder="Street, City, State" value={form.address} onChange={e => setForm({...form, address:e.target.value})} disabled={!canWrite} />
                </div>
                <div className="form-group full">
                  <label>Emergency Contact</label>
                  <input type="text" placeholder="Name — Phone number" value={form.emergency} onChange={e => setForm({...form, emergency:e.target.value})} disabled={!canWrite} />
                </div>
                <div className="form-group">
                  <label>Allergies</label>
                  <input type="text" placeholder="e.g. Penicillin, None" value={form.allergies} onChange={e => setForm({...form, allergies:e.target.value})} disabled={!canWrite} />
                </div>
                <div className="form-group">
                  <label>Clinical Notes</label>
                  <input type="text" placeholder="Optional notes" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} disabled={!canWrite} />
                </div>
              </div>
              {canWrite && (
                <button type="submit" className="btn btn-primary" style={{ marginTop:14, width:'100%', justifyContent:'center' }} disabled={submitting}>
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
