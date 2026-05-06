import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const DOCTORS = ['Dr. Marcus Williams','Dr. Patricia Holt','Dr. James Okafor'];
const DEPTS   = ['Cardiology','Pediatrics','Orthopedics','Neurology','Emergency','Oncology'];
const TIMES   = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM','4:00 PM'];

const INIT_APPOINTMENTS = [
  { id:'APT-001', pid:'P-001', patient:'Victoria Nguyen',  doctor:'Dr. Marcus Williams', dept:'Cardiology',  date:'2026-05-09', time:'10:00 AM', status:'Confirmed' },
  { id:'APT-002', pid:'P-002', patient:'Harold Bennett',   doctor:'Dr. Patricia Holt',   dept:'Pediatrics',  date:'2026-05-07', time:'9:00 AM',  status:'Confirmed' },
  { id:'APT-003', pid:'P-003', patient:'Camille Fontaine', doctor:'Dr. James Okafor',    dept:'Neurology',   date:'2026-05-08', time:'2:00 PM',  status:'Pending'   },
  { id:'APT-004', pid:'P-004', patient:'Derrick Lawson',   doctor:'Dr. Marcus Williams', dept:'Cardiology',  date:'2026-05-10', time:'11:00 AM', status:'Confirmed' },
  { id:'APT-005', pid:'P-005', patient:'Ingrid Castellano',doctor:'Dr. James Okafor',    dept:'Oncology',    date:'2026-05-22', time:'2:30 PM',  status:'Pending'   },
];

const INIT_PATIENTS = [
  { id:'P-001', name:'Victoria Nguyen'   },
  { id:'P-002', name:'Harold Bennett'    },
  { id:'P-003', name:'Camille Fontaine'  },
  { id:'P-004', name:'Derrick Lawson'    },
  { id:'P-005', name:'Ingrid Castellano' },
];

export default function Scheduling() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState(INIT_APPOINTMENTS);
  const [patients]                      = useState(INIT_PATIENTS);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState({ patientId:'', doctor:'', dept:'', date:'', time:'' });
  const [successMsg, setSuccessMsg]     = useState('');
  const [error, setError]               = useState('');

  const isPatient = user?.role === 'patient';
  const isNurse   = user?.role === 'nurse';
  const canCreate = ['admin','doctor','receptionist','patient'].includes(user?.role);
  const canEdit   = ['admin','doctor'].includes(user?.role);

  const myAppts = isPatient ? appointments.filter(a => a.pid === 'P-001') : appointments;

  const handleBook = (e) => {
    e.preventDefault();
    setError('');
    const patient = patients.find(p => p.id === form.patientId);
    if (!patient) { setError('Please select a registered patient.'); return; }
    const newAppt = {
      id: `APT-00${appointments.length + 1}`,
      pid: form.patientId,
      patient: patient.name,
      doctor: form.doctor,
      dept: form.dept,
      date: form.date,
      time: form.time,
      status: isPatient ? 'Pending' : 'Confirmed',
    };
    setAppointments(prev => [newAppt, ...prev]);
    setSuccessMsg(`✅ Appointment booked for ${patient.name} with ${form.doctor} on ${form.date}`);
    setShowForm(false);
    setForm({ patientId:'', doctor:'', dept:'', date:'', time:'' });
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const updateStatus = (id, status) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const cancel = (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const statusBadge = (s) => s === 'Confirmed' ? 'badge-success' : s === 'Pending' ? 'badge-warning' : 'badge-neutral';

  return (
    <div>
      {isPatient && <div className="alert alert-info">📅 Showing your appointments only.</div>}
      {isNurse   && <div className="alert alert-warning">⚠️ View only. Doctors, receptionists, and admins can modify appointments.</div>}
      {successMsg && <div className="alert alert-info">{successMsg}</div>}

      <div className="section-header">
        <span className="section-title">{isPatient ? 'Your Appointments' : 'All Appointments'}</span>
        {canCreate && <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ {isPatient ? 'Request' : 'Book'} Appointment</button>}
      </div>

      {showForm && (
        <div className="card card-body mb-4">
          <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>Book Appointment</div>
          {error && <div className="alert alert-danger" style={{ background:'#fef2f2', color:'#dc2626', marginBottom:10 }}>❌ {error}</div>}
          <form onSubmit={handleBook}>
            <div className="form-grid">
              {!isPatient && (
                <div className="form-group">
                  <label>Patient</label>
                  <select value={form.patientId} onChange={e => setForm({...form, patientId:e.target.value})} required>
                    <option value="">Select patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Doctor</label>
                <select value={form.doctor} onChange={e => setForm({...form, doctor:e.target.value})} required>
                  <option value="">Select doctor</option>
                  {DOCTORS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={form.dept} onChange={e => setForm({...form, dept:e.target.value})} required>
                  <option value="">Select dept</option>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <select value={form.time} onChange={e => setForm({...form, time:e.target.value})} required>
                  <option value="">Select time</option>
                  {TIMES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button type="submit" className="btn btn-primary">Confirm Booking</button>
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                {!isPatient && <th>Patient</th>}
                <th>Doctor</th>
                <th>Dept</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {myAppts.map(a => (
                <tr key={a.id}>
                  <td className="mono">{a.id}</td>
                  {!isPatient && <td>{a.patient}</td>}
                  <td>{a.doctor}</td>
                  <td>{a.dept}</td>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                  {canEdit && (
                    <td>
                      <div className="flex gap-8">
                        {a.status === 'Pending'    && <button className="btn btn-sm" onClick={() => updateStatus(a.id,'Confirmed')}>Confirm</button>}
                        {a.status === 'Confirmed'  && <button className="btn btn-sm" onClick={() => updateStatus(a.id,'Completed')}>Complete</button>}
                        <button className="btn btn-danger btn-sm" onClick={() => cancel(a.id)}>Cancel</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {myAppts.length === 0 && <tr><td colSpan="8" style={{ textAlign:'center', color:'#9ca3af', padding:24 }}>No appointments found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
