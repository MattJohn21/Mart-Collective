import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const INIT_INVOICES = [
  { id:'INV-1042', pid:'P-001', patient:'Victoria Nguyen',   date:'2026-04-28', amount:1250, paid:930,  status:'Partial' },
  { id:'INV-1043', pid:'P-002', patient:'Harold Bennett',    date:'2026-05-01', amount:800,  paid:800,  status:'Paid'    },
  { id:'INV-1044', pid:'P-003', patient:'Camille Fontaine',  date:'2026-05-02', amount:600,  paid:450,  status:'Partial' },
  { id:'INV-1045', pid:'P-004', patient:'Derrick Lawson',    date:'2026-05-04', amount:2100, paid:0,    status:'Unpaid'  },
  { id:'INV-1046', pid:'P-005', patient:'Ingrid Castellano', date:'2026-05-05', amount:3400, paid:2900, status:'Partial' },
];

const INIT_PATIENTS = [
  { id:'P-001', name:'Victoria Nguyen'   },
  { id:'P-002', name:'Harold Bennett'    },
  { id:'P-003', name:'Camille Fontaine'  },
  { id:'P-004', name:'Derrick Lawson'    },
  { id:'P-005', name:'Ingrid Castellano' },
];

export default function Billing() {
  const { user } = useAuth();

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('mc_invoices');
    return saved ? JSON.parse(saved) : INIT_INVOICES;
  });

  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ patientId:'', amount:'' });
  const [payId, setPayId]           = useState(null);
  const [payAmount, setPayAmount]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    localStorage.setItem('mc_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const isPatient = user?.role === 'patient';
  const canWrite  = ['admin','billing'].includes(user?.role);

  const myInvoices = isPatient
    ? invoices.filter(i => i.pid === 'P-001')
    : invoices;

  const total     = myInvoices.reduce((s,i) => s + i.amount, 0);
  const collected = myInvoices.reduce((s,i) => s + i.paid, 0);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleNewInvoice = (e) => {
    e.preventDefault();
    const patient = INIT_PATIENTS.find(p => p.id === form.patientId);
    if (!patient) return;
    const newInv = {
      id:      `INV-${1047 + invoices.length}`,
      pid:     form.patientId,
      patient: patient.name,
      date:    new Date().toISOString().split('T')[0],
      amount:  Number(form.amount),
      paid:    0,
      status:  'Unpaid',
    };
    setInvoices(prev => [newInv, ...prev]);
    flash(`✅ Invoice ${newInv.id} created for ${patient.name}`);
    setShowForm(false);
    setForm({ patientId:'', amount:'' });
  };

  const handlePay = (id) => {
    const amt = Number(payAmount);
    if (!amt || amt <= 0) return;
    setInvoices(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newPaid = Math.min(i.paid + amt, i.amount);
      return { ...i, paid: newPaid, status: newPaid >= i.amount ? 'Paid' : 'Partial' };
    }));
    flash(`✅ Payment of $${amt.toLocaleString()} recorded successfully.`);
    setPayId(null);
    setPayAmount('');
  };

  const statusBadge = (s) =>
    s === 'Paid'    ? 'badge-success' :
    s === 'Partial' ? 'badge-warning' : 'badge-danger';

  return (
    <div>
      {isPatient && (
        <div className="alert alert-info">
          🔒 Showing your invoices only. Contact billing staff for payment arrangements.
        </div>
      )}
      {successMsg && <div className="alert alert-info">{successMsg}</div>}

      {!isPatient && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Billed</div>
            <div className="stat-value">${total.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Collected</div>
            <div className="stat-value">${collected.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Outstanding</div>
            <div className="stat-value">${(total - collected).toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Unpaid</div>
            <div className="stat-value">{myInvoices.filter(i => i.status === 'Unpaid').length}</div>
          </div>
        </div>
      )}

      <div className="section-header">
        <span className="section-title">{isPatient ? 'Your Invoices' : 'All Invoices'}</span>
        {canWrite && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            + New Invoice
          </button>
        )}
      </div>

      {showForm && (
        <div className="card card-body mb-4">
          <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>Generate Invoice</div>
          <form onSubmit={handleNewInvoice}>
            <div className="form-grid">
              <div className="form-group">
                <label>Patient</label>
                <select
                  value={form.patientId}
                  onChange={e => setForm({...form, patientId:e.target.value})}
                  required
                >
                  <option value="">Select patient</option>
                  {INIT_PATIENTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  value={form.amount}
                  onChange={e => setForm({...form, amount:e.target.value})}
                  required
                />
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button type="submit" className="btn btn-primary">Generate Invoice</button>
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
                <th>Invoice ID</th>
                {!isPatient && <th>Patient</th>}
                <th>Date</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                {canWrite && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {myInvoices.map(inv => (
                <tr key={inv.id}>
                  <td className="mono">{inv.id}</td>
                  {!isPatient && <td>{inv.patient}</td>}
                  <td>{inv.date}</td>
                  <td>${inv.amount.toLocaleString()}</td>
                  <td>${inv.paid.toLocaleString()}</td>
                  <td>${(inv.amount - inv.paid).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${statusBadge(inv.status)}`}>{inv.status}</span>
                  </td>
                  {canWrite && (
                    <td>
                      {payId === inv.id ? (
                        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                          <input
                            type="number"
                            min="1"
                            placeholder="Amount"
                            value={payAmount}
                            onChange={e => setPayAmount(e.target.value)}
                            style={{ width:80, padding:'4px 8px', fontSize:12, border:'1px solid #e8eaf0', borderRadius:6 }}
                          />
                          <button className="btn btn-primary btn-sm" onClick={() => handlePay(inv.id)}>Pay</button>
                          <button className="btn btn-sm" onClick={() => { setPayId(null); setPayAmount(''); }}>✕</button>
                        </div>
                      ) : (
                        inv.status !== 'Paid' && (
                          <button className="btn btn-sm" onClick={() => setPayId(inv.id)}>
                            Process Payment
                          </button>
                        )
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {myInvoices.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign:'center', color:'#9ca3af', padding:24 }}>
                    No invoices found
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
