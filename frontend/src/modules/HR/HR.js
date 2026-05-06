import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function HR() {
  const { user, hasPermission } = useAuth();
  const [staff, setStaff]     = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin    = user?.role === 'admin';
  const canWrite   = hasPermission('hr', 'write');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, sumRes] = await Promise.all([
          axios.get('/api/hr'),
          axios.get('/api/hr/summary'),
        ]);
        setStaff(staffRes.data);
        setSummary(sumRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this employee?')) return;
    try {
      await axios.delete(`/api/hr/${id}`);
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      alert(e.response?.data?.error || 'Delete failed');
    }
  };

  if (loading) return <div className="loading">Loading HR data...</div>;

  const roleBadge = (r) =>
    r === 'Doctor' ? 'badge-info' : r === 'Nurse' ? 'badge-warning' : 'badge-purple';

  return (
    <div>
      {!isAdmin && (
        <div className="alert alert-warning">
          ⚠️ Salary information is visible to Administrators only.
        </div>
      )}

      {summary && (
        <div className="stats-row">
          <div className="stat-card"><div className="stat-label">Total Staff</div><div className="stat-value">{summary.total}</div></div>
          <div className="stat-card"><div className="stat-label">Active</div><div className="stat-value">{summary.active}</div></div>
          <div className="stat-card"><div className="stat-label">On Leave</div><div className="stat-value">{summary.onLeave}</div></div>
          <div className="stat-card"><div className="stat-label">Doctors / Nurses</div><div className="stat-value">{summary.doctors} / {summary.nurses}</div></div>
        </div>
      )}

      <div className="section-header">
        <span className="section-title">Staff Directory</span>
        {isAdmin && <button className="btn btn-primary btn-sm">+ Add Employee</button>}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                {isAdmin && <th>Salary</th>}
                <th>Start Date</th>
                <th>Status</th>
                {canWrite && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {staff.map(emp => (
                <tr key={emp.id}>
                  <td className="mono">{emp.id}</td>
                  <td>{emp.name}</td>
                  <td><span className={`badge ${roleBadge(emp.role)}`}>{emp.role}</span></td>
                  <td>{emp.dept}</td>
                  {isAdmin && <td>${emp.salary?.toLocaleString()}</td>}
                  <td>{emp.start}</td>
                  <td><span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{emp.status}</span></td>
                  {canWrite && (
                    <td>
                      <div className="flex gap-8">
                        <button className="btn btn-sm">Edit</button>
                        {isAdmin && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.id)}>Remove</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
