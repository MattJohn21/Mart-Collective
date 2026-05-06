import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Scheduling() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const isPatient = user?.role === 'patient';
  const canCreate = ['admin', 'doctor', 'patient'].includes(user?.role);
  const canEdit   = ['admin', 'doctor'].includes(user?.role);

  useEffect(() => {
    axios.get('/api/scheduling')
      .then(res => setAppointments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await axios.patch(`/api/scheduling/${id}`, { status });
      setAppointments(prev => prev.map(a => a.id === id ? res.data : a));
    } catch (e) {
      alert(e.response?.data?.error || 'Update failed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await axios.delete(`/api/scheduling/${id}`);
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      alert(e.response?.data?.error || 'Cancel failed');
    }
  };

  if (loading) return <div className="loading">Loading schedule...</div>;

  const statusBadge = (s) =>
    s === 'Confirmed' ? 'badge-success' : s === 'Pending' ? 'badge-warning' : 'badge-neutral';

  return (
    <div>
      {isPatient && (
        <div className="alert alert-info">
          📅 You can view and request appointments. Contact your provider to reschedule.
        </div>
      )}
      {user?.role === 'nurse' && (
        <div className="alert alert-warning">
          ⚠️ Nurses can view the schedule. Only doctors and admins can create or modify appointments.
        </div>
      )}

      <div className="section-header">
        <span className="section-title">
          {isPatient ? 'Your Appointments' : 'All Appointments'}
        </span>
        {canCreate && (
          <button className="btn btn-primary btn-sm">
            + {isPatient ? 'Request Appointment' : 'New Appointment'}
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                {!isPatient && <th>Patient</th>}
                <th>Doctor</th>
                <th>Department</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt.id}>
                  <td className="mono">{appt.id}</td>
                  {!isPatient && <td>{appt.patientName}</td>}
                  <td>{appt.doctor}</td>
                  <td>{appt.dept}</td>
                  <td>{appt.date}</td>
                  <td>{appt.time}</td>
                  <td><span className={`badge ${statusBadge(appt.status)}`}>{appt.status}</span></td>
                  {canEdit && (
                    <td>
                      <div className="flex gap-8">
                        {appt.status === 'Pending' && (
                          <button className="btn btn-sm" onClick={() => handleStatusChange(appt.id, 'Confirmed')}>
                            Confirm
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt.id)}>
                          Cancel
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', color: '#8a8fa8', padding: 24 }}>No appointments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
