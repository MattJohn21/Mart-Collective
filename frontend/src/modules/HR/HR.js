import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const INIT_STAFF = [
  { id:'E-201', name:'Dr. Marcus Williams', role:'Doctor',      dept:'Cardiology', status:'Active', salary:198000, start:'2019-01-15' },
  { id:'E-202', name:'Natalie Osei',        role:'Nurse',       dept:'Pediatrics', status:'Active', salary:81000,  start:'2021-03-08' },
  { id:'E-203', name:'Raymond Ellison',     role:'HR',          dept:'HR',         status:'Active', salary:67000,  start:'2020-07-20' },
  { id:'E-204', name:'Dr. Patricia Holt',   role:'Doctor',      dept:'Neurology',  status:'Leave',  salary:214000, start:'2017-05-12' },
  { id:'E-205', name:'Jordan Hargrove',     role:'Receptionist',dept:'Admin',      status:'Active', salary:52000,  start:'2022-09-01' },
  { id:'E-206', name:'Dr. James Okafor',    role:'Doctor',      dept:'Oncology',   status:'Active', salary:228000, start:'2015-11-03' },
  { id:'E-207', name:'Simone Caldwell',     role:'Billing',     dept:'Finance',    status:'Active', salary:61000,  start:'2023-02-14' },
];

const EMPTY_STAFF = { name:'', role:'', dept:'', status:'Active', salary:'', start:'' };

export default function HR() {
  const { user } = useAuth();

  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem('mc_staff');
    return saved ? JSON.parse(saved) : INIT_STAFF;
  });

  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_STAFF);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError]           = useState('');

  useEffect(() => {
    localStorage.setItem('mc_staff', JSON.stringify(staff));
  }, [staff]);

  const isAdmin    = user?.role === 'admin';
  const isHR       = user?.role === 'hr';
  const canWrite   = isAdmin || isHR;
  const canSalary  = isAdmin;

  const active  = staff.filter(s => s.status === 'Active').length;
  const onLeave = staff.filter(s => s.status === 'Leave').length;
  const doctors = staff.filter(s => s.role === 'Doctor').length;
  const nurses  = staff.filter(s => s.role === 'Nurse').length;

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.role || !form.dept) {
      setError('Name, role, and department are required.');
      return;
    }
    const newEmployee = {
      id:     'E-' + (208 + staff.length),
      name:   form.name,
      role:   form.role,
      dept:   form.dept,
      status: form.status,
      salary: canSalary ? Number(form.salary) || 0 : 0,
      start:  form.start || new Date().toISOString().split('T')[0],
    };
    setStaff(prev => [newEmployee, ...prev]);
    flash('✅ ' + form.name + ' added to staff directory.');
    setShowForm(false);
    setForm(EMPTY_STAFF);
  };

  const handleDelete = (id, name) => {
    if (!window.confirm('Remove ' + name + ' from the directory?')) return;
    setStaff(prev => prev.filter(s => s.id !== id));
    flash('Employee removed from directory.');
  };

  const roleBadge = (r) =>
    r === 'Doctor' ? 'badge-info' :
    r === 'Nurse'  ? 'badge-warning' : 'badge-purple';

  return (
    <div>
      {isHR && !isAdmin && (
        <div className="alert alert-warning">
          ⚠️ Salary details are visible to Administrators only. You can add and remove staff.
        </div>
      )}
      {successMsg && <div className="alert alert-info">{successMsg}</div>}

      <div className="stats-row">
        <div className="stat-card"><div className="stat-label">Total Staff</div><div className="stat-value">{staff.length}</div></div>
        <div className="stat-card"><div className="stat-label">Active</div><div className="stat-value">{active}</div></div>
        <div className="stat-card"><div className="stat-label">On Leave</div><div className="stat-value">{onLeave}</div></div>
        <div className="stat-card"><div className="stat-label">Doctors / Nurses</div><div className="stat-value">{doctors} / {nurses}</div></div>
      </div>

      <div className="section-header">
        <span className="section-title">Staff Directory</span>
        {canWrite && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            + Add Employee
          </button>
        )}
      </div>

      {showForm && canWrite && (
        <div className="card card-body mb-4">
          <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>Add New Employee</div>
          {error && (
            <div className="alert" style={{ background:'#fef2f2', color:'#dc2626', marginBottom:10 }}>
              ❌ {error}
            </div>
          )}
          <form onSubmit={handleAddStaff}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Jane Smith"
                  value={form.name}
                  onChange={e => setForm({...form, name:e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={e => setForm({...form, role:e.target.value})} required>
                  <option value="">Select role</option>
                  <option>Doctor</option>
                  <option>Nurse</option>
                  <option>Receptionist</option>
                  <option>Billing</option>
                  <option>HR</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={form.dept} onChange={e => setForm({...form, dept:e.target.value})} required>
                  <option value="">Select department</option>
                  <option>Cardiology</option>
                  <option>Pediatrics</option>
                  <option>Orthopedics</option>
                  <option>Neurology</option>
                  <option>Emergency</option>
                  <option>Oncology</option>
                  <option>HR</option>
                  <option>Finance</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                  <option>Active</option>
                  <option>Leave</option>
                </select>
              </div>
              {canSalary && (
                <div className="form-group">
                  <label>Salary ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 85000"
                    value={form.salary}
                    onChange={e => setForm({...form, salary:e.target.value})}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={form.start}
                  onChange={e => setForm({...form, start:e.target.value})}
                />
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button type="submit" className="btn btn-primary">Add Employee</button>
              <button type="button" className="btn" onClick={() => { setShowForm(false); setForm(EMPTY_STAFF); }}>
                Cancel
              </button>
            </div>
            {isHR && !isAdmin && (
              <div style={{ marginTop:10, fontSize:12, color:'#9ca3af' }}>
                ℹ️ Salary field is only visible to administrators.
              </div>
            )}
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                {canSalary && <th>Salary</th>}
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
                  <td><span className={'badge ' + roleBadge(emp.role)}>{emp.role}</span></td>
                  <td>{emp.dept}</td>
                  {canSalary && <td>${emp.salary.toLocaleString()}</td>}
                  <td>{emp.start}</td>
                  <td>
                    <span className={'badge ' + (emp.status === 'Active' ? 'badge-success' : 'badge-neutral')}>
                      {emp.status}
                    </span>
                  </td>
                  {canWrite && (
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(emp.id, emp.name)}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign:'center', color:'#9ca3af', padding:24 }}>
                    No staff found
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
