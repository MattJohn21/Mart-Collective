import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ROLE_STATS = {
  admin:   [{ label: 'Total Patients', value: '247', sub: '+12 this week' }, { label: 'Open Invoices', value: '$18,420', sub: '3 overdue' }, { label: 'Active Staff', value: '64', sub: '2 on leave' }, { label: "Today's Appts", value: '31', sub: '8 remaining' }],
  doctor:  [{ label: 'My Patients Today', value: '8', sub: '3 remaining' }, { label: 'Pending Reviews', value: '4', sub: 'action needed' }, { label: 'Admitted', value: '2', sub: 'stable' }, { label: 'Next Appt', value: '2:00 PM', sub: 'P-002' }],
  nurse:   [{ label: 'Patients Assigned', value: '12', sub: '' }, { label: 'Medications Due', value: '5', sub: 'check times' }, { label: 'Shift', value: 'Day', sub: '7am–3pm' }, { label: 'Alerts', value: '2', sub: 'urgent' }],
  hr:      [{ label: 'Total Staff', value: '64', sub: '' }, { label: 'Open Positions', value: '3', sub: 'hiring' }, { label: 'On Leave', value: '2', sub: '' }, { label: 'Payroll Due', value: 'May 15', sub: '9 days' }],
  patient: [{ label: 'Upcoming Appts', value: '2', sub: 'next: May 9' }, { label: 'Outstanding Balance', value: '$320', sub: 'due May 20' }, { label: 'Prescriptions', value: '3', sub: 'active' }, { label: 'Provider', value: 'Dr. Chen', sub: 'Cardiology' }],
};

export default function Dashboard() {
  const { user } = useAuth();
  const stats = ROLE_STATS[user?.role] || [];

  return (
    <div>
      <div className="stats-row">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            {s.sub && <div className="stat-sub">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="alert alert-info">
        Welcome back, <strong>{user?.name}</strong>. You are signed in as <strong>{user?.role}</strong>. Use the sidebar to navigate your available modules.
      </div>

      <div className="card card-body">
        <h3 style={{ marginBottom: 12, fontSize: 14, fontWeight: 700 }}>Your Access Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Module</th>
              <th>Access</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { module: 'Billing',      key: 'billing'      },
              { module: 'Human Resources', key: 'hr'        },
              { module: 'Scheduling',   key: 'scheduling'   },
              { module: 'Registration', key: 'registration' },
            ].map(row => {
              const perms = user ? (require('../../context/AuthContext') && null) : null;
              return (
                <tr key={row.key}>
                  <td>{row.module}</td>
                  <td>—</td>
                  <td>—</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
