import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const DOCTORS = ['Dr. Marcus Williams','Dr. Patricia Holt','Dr. James Okafor'];
const DEPTS   = ['Cardiology','Pediatrics','Orthopedics','Neurology','Emergency','Oncology'];
const TIMES   = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM','4:00 PM'];

const INIT_APPOINTMENTS = [
  { id:'APT-001', pid:'P-001', patient:'Victoria Nguyen',   doctor:'Dr. Marcus Williams', dept:'Cardiology', date:'2026-05-09', time:'10:00 AM', status:'Confirmed' },
  { id:'APT-002', pid:'P-002', patient:'Harold Bennett',    doctor:'Dr. Patricia Holt',   dept:'Pediatrics', date:'2026-05-07', time:'9:00 AM',  status:'Confirmed' },
  { id:'APT-003', pid:'P-003', patient:'Camille Fontaine',  doctor:'Dr. James Okafor',    dept:'Neurology',  date:'2026-05-08', time:'2:00 PM',  status:'Pending'   },
  { id:'APT-004', pid:'P-004', patient:'Derrick Lawson',    doctor:'Dr. Marcus Williams', dept:'Cardiology', date:'2026-05-10', time:'11:00 AM', status:'Confirmed' },
  { id:'APT-005', pid:'P-005', patient:'Ingrid Castellano', doctor:'Dr. James Okafor',    dept:'Oncology',   date:'2026-05-22', time:'2:30 PM',  status:'Pending'   },
];

const INIT_PATIENTS = [
  { id:'P-001', name:'Victoria Nguyen'   },
  { id:'P-002', name:'Harold Bennett'    },
  { id:'P-003', name:'Camille Fontaine'  },
  { id:'P-004', name:'Derrick Lawson'    },
  { id:'P-005', name:'Ingrid Castellano' },
];

const EMPTY_FORM = { patientId:'', patientName:'', doctor:'', dept:'', date:'', time:'' };

export default function Scheduling() {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('mc_appointments');
    return saved ? JSON.parse(saved) : INIT_APPOINTMENTS;
  });

  const [patients] = useState(INIT_PATIENTS);
  const [showForm, setShowForm]     = useState(false);
  const [editAppt, setEditAppt]     = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError]           = useState('');

  useEffect(() => {
    localStorage.setItem('mc_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const isPatient = user?.role === 'patient';
  const isNurse   = user?.role === 'nurse';
  const canCreate = ['admin','doctor','receptionist','patient'].includes(user?.role);
  const canEdit   = ['admin','doctor','receptionist'].includes(user?.role);

  const myAppts = isPatient
    ? appointments.filter(a => a.pid === 'P-001')
    : appointments;

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const openBookForm = () => {
    setEditAppt(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (appt) => {
    setEditAppt(appt);
    setForm({
      patientId:   appt.pid,
      patientName: appt.patient,
      doctor:      appt.doctor,
      dept:        appt.dept,
      date:        appt.date,
      time:        appt.time,
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isPatient && !form.patientName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!isPatient && !form.patientId) {
      setError('Please select a registered patient.');
      return;
    }
    if (!form.doctor || !form.dept || !form.date || !form.time) {
      setError('Please fill in all fields.');
      return;
    }

    const pid         = isPatient ? 'P-001' : form.patientId;
    const patientName = isPatient
      ? form.patientName.trim()
      : patients.find(p => p.id === form.patientId)?.name;

    if (editAppt) {
      setAppointments(prev => prev.map(a =>
        a.id === editAppt.id
          ? { ...a, patient: patientName, doctor: form.doctor, dept: form.dept, date: form.date, time: form.time, status: isPatient ? a.status : 'Confirmed' }
          : a
      ));
      flash(`✅ Appointment ${editAppt.id} rescheduled to ${form.date} at ${form.time}.`);
    } else {
      const newAppt = {
        id:      `APT-${String(appointments.length + 1).padStart(3,'0')}`,
        pid,
        patient: patientName,
        doctor:  form.doctor,
        dept:    form.dept,
        date:    form.date,
        time:    form.time,
        status:  isPatient ? 'Pending' : 'Confirmed',
      };
      setAppointments(prev => [newAppt, ...prev]);
      flash(`✅ Appointment booked for ${patientName} with ${form.doctor} on ${form.date}.`);
    }

    setShowForm(false);
    setEditAppt(null);
    setForm(EMPTY_FORM);
  };

  const updateStatus = (id, status) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    flash(`✅ Appointment ${id} marked as ${status}.`);
  };

  const cancel = (id) => {
    if (!window.confirm('Cancel this appointment? This cannot be undone.')) return;
    setAppointments(prev => prev.filter(a => a.id !== id));
    flash(`Appointment ${id} has been cancelled.`);
  };

  const statusBadge = (s) =>
    s === 'Confirmed' ? 'badge-success' :
    s === 'Pending'   ? 'badge-warning' :
    s === 'Completed' ? 'badge-neutral' : 'badge-danger';

  return (
    <div>
      {isPatient && <div className="alert alert-info">📅 Showing your appointments. Requested appointments are pending confirmation.</div>}
      {isNurse   && <div className="alert alert-warning">⚠️ View only. Doctors, receptionists, and admins can modify appointments.</div>}
      {successMsg && <div className="alert alert-info">{successMsg}</div>}

      <div className="section-header">
        <span className="section-title">{isPatient ? 'Your Appointments' : 'All Appointments'}</span>
        {canCreate && !showForm && (
          <button className="btn btn-primary btn-sm" onClick={openBookForm}>
            + {isPatient ? 'Request' : 'Book'} Appointment
          </button>
        )}
      </div>

      {showForm && (
        <div className="card card-body mb-4">
          <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>
            {editAppt ? `Reschedule ${editAppt.id}` : isPatient ? 'Request Appointment' : 'Book Appointment'}
          </div>
          {error && (
            <div className="alert" style={{ background:'#fef2f2', color:'#dc2626', marginBottom:10 }}>
              ❌ {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              {isPatient && (
                <div className="form-group full">
                  <label>Your Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your first and last name"
                    value={form.patientName}
                    onChange={e => setForm({...form, patientName:e.target.value})}
                    required
                  />
                </div>
              )}

              {!isPatient && !editAppt && (
                <div className="form-group">
                  <label>Patient</label>
                  <select
                    value={form.patientId}
                    onChange={e => setForm({...form, patientId:e.target.value})}
                    required
                  >
                    <option value="">Select patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Doctor</label>
                <select
                  value={form.doctor}
                  onChange={e => setForm({...form, doctor:e.target.value})}
                  required
                >
                  <option value="">Select doctor</option>
                  {DOCTORS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  value={form.dept}
                  onChange={e => setForm({...form, dept:e.target.value})}
                  required
                >
                  <option value="">Select department</option>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({...form, date:e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time</label>
                <select
                  value={form.time}
                  onChange={e => setForm({...form, time:e.target.value})}
                  required
                >
                  <option value="">Select time</option>
                  {TIMES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

            </div>

            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button type="submit" className="btn btn-primary">
                {editAppt ? 'Save Changes' : isPatient ? 'Submit Request' : 'Confirm Booking'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => { setShowForm(false); setEditAppt(null); setForm(EMPTY_FORM); }}
              >
                Cancel
              </button>
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
                <th>Actions</th>
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
                  <td>
                    <div className="flex gap-8">
                      {canEdit && a.status !== 'Completed' && (
                        <button className="btn btn-sm" onClick={() => openEditForm(a)}>
                          Reschedule
                        </button>
                      )}
                      {canEdit && a.status === 'Pending' && (
                        <button className="btn btn-sm" onClick={() => updateStatus(a.id,'Confirmed')}>
                          Confirm
                        </button>
                      )}
                      {canEdit && a.status === 'Confirmed' && (
                        <button className="btn btn-sm" onClick={() => updateStatus(a.id,'Completed')}>
                          Complete
                        </button>
                      )}
                      {isPatient && a.status === 'Pending' && (
                        <button className="btn btn-danger btn-sm" onClick={() => cancel(a.id)}>
                          Cancel
                        </button>
                      )}
                      {canEdit && (
                        <button className="btn btn-danger btn-sm" onClick={() => cancel(a.id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {myAppts.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign:'center', color:'#9ca3af', padding:24 }}>
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
