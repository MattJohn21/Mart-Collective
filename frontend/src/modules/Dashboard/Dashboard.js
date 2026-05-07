import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ROLE_STATS = {
  admin:        [{ label:'Total Patients', value:'312', sub:'+8 this week' }, { label:'Open Invoices', value:'$24,180', sub:'4 overdue' }, { label:'Active Staff', value:'71', sub:'3 on leave' }, { label:"Today's Appts", value:'38', sub:'11 remaining' }],
  doctor:       [{ label:'My Patients Today', value:'9', sub:'4 remaining' }, { label:'Pending Reviews', value:'3', sub:'action needed' }, { label:'Admitted', value:'2', sub:'stable' }, { label:'Next Appt', value:'1:30 PM', sub:'P-003' }],
  nurse:        [{ label:'Patients Assigned', value:'14', sub:'' }, { label:'Medications Due', value:'6', sub:'check times' }, { label:'Shift', value:'Day', sub:'7am–3pm' }, { label:'Alerts', value:'1', sub:'urgent' }],
  receptionist: [{ label:'Check-ins Today', value:'17', sub:'5 pending' }, { label:'Appointments', value:'38', sub:'11 remaining' }, { label:'Registrations', value:'4', sub:'today' }, { label:'Pending Requests', value:'3', sub:'need confirm' }],
  billing:      [{ label:'Invoices This Week', value:'14', sub:'' }, { label:'Collected Today', value:'$6,450', sub:'' }, { label:'Outstanding', value:'$4,210', sub:'4 invoices' }, { label:'Unpaid', value:'2', sub:'overdue' }],
  hr:           [{ label:'Total Staff', value:'71', sub:'' }, { label:'Open Positions', value:'2', sub:'hiring' }, { label:'On Leave', value:'3', sub:'' }, { label:'Payroll Due', value:'May 15', sub:'9 days' }],
  patient:      [{ label:'Upcoming Appts', value:'2', sub:'next: May 12' }, { label:'Balance Due', value:'$415', sub:'due May 25' }, { label:'Prescriptions', value:'2', sub:'active' }, { label:'Provider', value:'Dr. Williams', sub:'Cardiology' }],
};

const MODULE_ACCESS = {
  admin: [
    { module:'Billing',         access:true,  permissions:'Read, write, delete invoices. Process payments.'         },
    { module:'Human Resources', access:true,  permissions:'Full staff directory. View salaries. Add/remove staff.'  },
    { module:'Scheduling',      access:true,  permissions:'Book, confirm, reschedule, complete, cancel appointments.'},
    { module:'Registration',    access:true,  permissions:'Register, edit, and delete patient records.'              },
  ],
  doctor: [
    { module:'Billing',         access:false, permissions:'No access'                                               },
    { module:'Human Resources', access:false, permissions:'No access'                                               },
    { module:'Scheduling',      access:true,  permissions:'View all appointments. Confirm, complete, reschedule.'   },
    { module:'Registration',    access:true,  permissions:'View and register new patients.'                         },
  ],
  nurse: [
    { module:'Billing',         access:false, permissions:'No access'                                               },
    { module:'Human Resources', access:false, permissions:'No access'                                               },
    { module:'Scheduling',      access:true,  permissions:'View schedule only. Cannot modify appointments.'         },
    { module:'Registration',    access:true,  permissions:'View patient records only. Cannot register patients.'    },
  ],
  receptionist: [
    { module:'Billing',         access:false, permissions:'No access'                                               },
    { module:'Human Resources', access:false, permissions:'No access'                                               },
    { module:'Scheduling',      access:true,  permissions:'Book, reschedule, and cancel appointments.'              },
    { module:'Registration',    access:true,  permissions:'Register and view patient records.'                      },
  ],
  billing: [
    { module:'Billing',         access:true,  permissions:'Generate invoices. Process cash and card payments.'      },
    { module:'Human Resources', access:false, permissions:'No access'                                               },
    { module:'Scheduling',      access:false, permissions:'No access'                                               },
    { module:'Registration',    access:false, permissions:'No access'                                               },
  ],
  hr: [
    { module:'Billing',         access:false, permissions:'No access'                                               },
    { module:'Human Resources', access:true,  permissions:'View staff directory. Add and remove employees. No salary visibility.' },
    { module:'Scheduling',      access:false, permissions:'No access'                                               },
    { module:'Registration',    access:false, permissions:'No access'                                               },
  ],
  patient: [
    { module:'Billing',         access:true,  permissions:'View your own invoices only.'                            },
    { module:'Human Resources', access:false, permissions:'No access'                                               },
    { module:'Scheduling',      access:true,  permissions:'View your appointments. Request new appointments.'       },
    { module:'Registration',    access:false, permissions:'No access'                                               },
  ],
};

const ROLE_LABELS = {
  admin:'Administrator', doctor:'Doctor', nurse:'Nurse',
  receptionist:'Receptionist', billing:'Billing Staff', hr:'HR Staff', patient:'Patient',
};

export default function Dashboard() {
  const { user } = useAuth();
  const stats  = ROLE_STATS[user?.role]  || [];
  const access = MODULE_ACCESS[user?.role] || [];

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
        Welcome back, <strong>{user?.name}</strong>. Signed in as <strong>{ROLE_LABELS[user?.role]}</strong>. Locked modules are greyed out in the sidebar.
      </div>

      <div className="section-header">
        <span className="section-title">Your Module Access & Permissions</span>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th style={{ width:'22%' }}>Module</th>
              <th style={{ width:'15%' }}>Access</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {access.map((row) => (
              <tr key={row.module}>
                <td style={{ fontWeight:500 }}>{row.module}</td>
                <td>
                  <span className={'badge ' + (row.access ? 'badge-success' : 'badge-danger')}>
                    {row.access ? 'Allowed' : 'Restricted'}
                  </span>
                </td>
                <td style={{ fontSize:12, color: row.access ? 'var(--color-text-primary)' : '#9ca3af' }}>
                  {row.permissions}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
