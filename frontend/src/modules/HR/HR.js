import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const INIT_STAFF = [
  { id:'E-201', name:'Dr. Marcus Williams',  role:'Doctor', dept:'Cardiology', status:'Active', salary:198000, start:'2019-01-15' },
  { id:'E-202', name:'Natalie Osei',         role:'Nurse',  dept:'Pediatrics', status:'Active', salary:81000,  start:'2021-03-08' },
  { id:'E-203', name:'Raymond Ellison',      role:'HR',     dept:'HR',         status:'Active', salary:67000,  start:'2020-07-20' },
  { id:'E-204', name:'Dr. Patricia Holt',    role:'Doctor', dept:'Neurology',  status:'Leave',  salary:214000, start:'2017-05-12' },
  { id:'E-205', name:'Jordan Hargrove',      role:'Receptionist', dept:'Admin', status:'Active', salary:52000, start:'2022-09-01' },
  { id:'E-206', name:'Dr. James Okafor',     role:'Doctor', dept:'Oncology',   status:'Active', salary:228000, start:'2015-11-03' },
  { id:'E-207', name:'Simone Caldwell',      role:'Billing',dept:'Finance',    status:'Active', salary:61000,  start:'2023-02-14' },
];

export default function HR() {
  const { user } = useAuth();
  const [staff, setStaff] = useState(INIT_STAFF);
  const isAdmin  = user?.role === 'admin';
  const canWrite = ['admin','hr'].includes(user?.role);

  const handleDelete = (id) => {
    if (!window.confirm('Remove this employee?')) return;
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  const roleBadge = (r) => r === 'Doctor' ? 'badge-info' : r === 'Nurse' ? 'badge-warning' : 'badge-purple';

  const active   = staff.filter(s => s.status === 'Active').length;
  const onLeave  = staff.filter(s => s.status === 'Leave').length;
  const doctors  = staff.filter(s => s.role === 'Doctor').length;
  const nurses   = staff.filter(s => s.role === 'Nurse').length;

  return (
    <div>
      {!isAdmin && <div className="alert alert-warning">⚠️ Salary information is visible to Administrators only.</div>}

      <div className="stats-row">
        <div className="stat-card"><div className="stat-label">Total Staff</div><div className="stat-value">{staff.length}</div></div>
        <div className="stat-card"><div className="stat-label">Active</div><div className="stat-value">{active}</div></div>
        <div className="stat-card"><div className="stat-label">On Leave</div><div className="stat-value">{onLeave}</div></div>
        <div className="stat-card"><div className="stat-label">Doctors / Nurses</div><div className="stat-value">{doctors} / {nurses}</div></div>
      </div>

      <div className="section-header">
        <span className="section-title">Staff Directory</span>
        {isAdmin && <button className="btn btn-primary btn-sm">+ Add Employee</button>}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Role</th><th>Department</th>
                {isAdmin && <th>Salary</th>}
                <th>Start Date</th><th>Status</th>
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
                  {isAdmin && <td>${emp.salary.toLocaleString()}</td>}
                  <td>{emp.start}</td>
                  <td><span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{emp.status}</span></td>
                  {canWrite && (
                    <td>
                      <div className="flex gap-8">
                        <button className="btn btn-sm">Edit</button>
                        {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.id)}>Remove</button>}
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
