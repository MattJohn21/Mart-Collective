import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const INIT_INVOICES = [
  { id:'INV-1042', pid:'P-001', patient:'Victoria Nguyen',   date:'2026-04-28', amount:1250, paid:930,  status:'Partial', payMethod:'' },
  { id:'INV-1043', pid:'P-002', patient:'Harold Bennett',    date:'2026-05-01', amount:800,  paid:800,  status:'Paid',    payMethod:'Card' },
  { id:'INV-1044', pid:'P-003', patient:'Camille Fontaine',  date:'2026-05-02', amount:600,  paid:450,  status:'Partial', payMethod:'Cash' },
  { id:'INV-1045', pid:'P-004', patient:'Derrick Lawson',    date:'2026-05-04', amount:2100, paid:0,    status:'Unpaid',  payMethod:'' },
  { id:'INV-1046', pid:'P-005', patient:'Ingrid Castellano', date:'2026-05-05', amount:3400, paid:2900, status:'Partial', payMethod:'Insurance' },
];

const INIT_PATIENTS = [
  { id:'P-001', name:'Victoria Nguyen',   insurance:'BlueCross' },
  { id:'P-002', name:'Harold Bennett',    insurance:'Aetna'     },
  { id:'P-003', name:'Camille Fontaine',  insurance:'UHC'       },
  { id:'P-004', name:'Derrick Lawson',    insurance:'Medicaid'  },
  { id:'P-005', name:'Ingrid Castellano', insurance:'Cigna'     },
];

const INSURANCE_PROVIDERS = [
  'BlueCross BlueShield',
  'Aetna',
  'UnitedHealthcare',
  'Cigna',
  'Medicaid',
  'Medicare',
  'Humana',
  'Kaiser Permanente',
  'Other',
];

export default function Billing() {
  const { user } = useAuth();

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('mc_invoices');
    return saved ? JSON.parse(saved) : INIT_INVOICES;
  });

  const [completedAppts, setCompletedAppts] = useState(() => {
    const appts     = localStorage.getItem('mc_appointments');
    const all       = appts ? JSON.parse(appts) : [];
    const billed    = localStorage.getItem('mc_billed_appts');
    const billedIds = billed ? JSON.parse(billed) : [];
    return all.filter(a => a.status === 'Completed' && !billedIds.includes(a.id));
  });

  const [billedApptIds, setBilledApptIds] = useState(() => {
    const saved = localStorage.getItem('mc_billed_appts');
    return saved ? JSON.parse(saved) : [];
  });

  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState({ patientId:'', amount:'' });
  const [payId, setPayId]               = useState(null);
  const [payAmount, setPayAmount]       = useState('');
  const [payMethod, setPayMethod]       = useState('');
  const [cardStep, setCardStep]         = useState('form');
  const [cardError, setCardError]       = useState('');
  const [card, setCard]                 = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [insuranceStep, setInsuranceStep] = useState('form');
  const [insuranceForm, setInsuranceForm] = useState({ provider:'', memberId:'', groupNumber:'', notes:'' });
  const [insuranceError, setInsuranceError] = useState('');
  const [successMsg, setSuccessMsg]     = useState('');
  const [activeTab, setActiveTab]       = useState('invoices');

  useEffect(() => { localStorage.setItem('mc_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('mc_billed_appts', JSON.stringify(billedApptIds)); }, [billedApptIds]);

  const isPatient = user?.role === 'patient';
  const canWrite  = ['admin','billing'].includes(user?.role);

  const myInvoices = isPatient ? invoices.filter(i => i.pid === 'P-001') : invoices;
  const total      = myInvoices.reduce((s,i) => s + i.amount, 0);
  const collected  = myInvoices.reduce((s,i) => s + i.paid, 0);

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 6000); };

  const resetPay = () => {
    setPayId(null); setPayAmount(''); setPayMethod('');
    setCardStep('form'); setCardError('');
    setCard({ number:'', name:'', expiry:'', cvv:'' });
    setInsuranceStep('form'); setInsuranceError('');
    setInsuranceForm({ provider:'', memberId:'', groupNumber:'', notes:'' });
  };

  const applyPayment = (id, amt, method) => {
    setInvoices(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newPaid = Math.min(i.paid + amt, i.amount);
      return { ...i, paid: newPaid, status: newPaid >= i.amount ? 'Paid' : 'Partial', payMethod: method };
    }));
    flash('✅ $' + amt.toLocaleString() + ' payment via ' + method + ' recorded successfully.');
    resetPay();
  };

  const handleCash = (id) => {
    const amt = Number(payAmount);
    if (!amt || amt <= 0) return;
    applyPayment(id, amt, 'Cash');
  };

  const fmtCard = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const fmtExp  = (v) => {
    const d = v.replace(/\D/g,'').slice(0,4);
    return d.length >= 3 ? d.slice(0,2) + '/' + d.slice(2) : d;
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    setCardError('');
    const raw = card.number.replace(/\s/g,'');
    if (raw.length !== 16)        { setCardError('Card number must be 16 digits.'); return; }
    if (!card.name.trim())        { setCardError('Cardholder name is required.'); return; }
    if (card.expiry.length !== 5) { setCardError('Enter expiry as MM/YY.'); return; }
    if (card.cvv.length !== 3)    { setCardError('CVV must be 3 digits.'); return; }
    const [mm, yy] = card.expiry.split('/');
    if (new Date(2000 + Number(yy), Number(mm) - 1) < new Date()) { setCardError('This card has expired.'); return; }
    setCardStep('processing');
    setTimeout(() => { setCardStep('success'); setTimeout(() => applyPayment(payId, Number(payAmount), 'Card'), 1500); }, 2000);
  };

  const handleInsuranceSubmit = (e) => {
    e.preventDefault();
    setInsuranceError('');
    if (!insuranceForm.provider)  { setInsuranceError('Please select an insurance provider.'); return; }
    if (!insuranceForm.memberId.trim()) { setInsuranceError('Member ID is required.'); return; }
    setInsuranceStep('processing');
    setTimeout(() => {
      setInsuranceStep('success');
      setTimeout(() => applyPayment(payId, Number(payAmount), 'Insurance'), 2500);
    }, 2500);
  };

  const handleNewInvoice = (e) => {
    e.preventDefault();
    const patient = INIT_PATIENTS.find(p => p.id === form.patientId);
    if (!patient) return;
    const newInv = {
      id:      'INV-' + (1047 + invoices.length),
      pid:     form.patientId,
      patient: patient.name,
      date:    new Date().toISOString().split('T')[0],
      amount:  Number(form.amount),
      paid:    0,
      status:  'Unpaid',
      payMethod: '',
    };
    setInvoices(prev => [newInv, ...prev]);
    flash('✅ Invoice ' + newInv.id + ' created for ' + patient.name);
    setShowForm(false);
    setForm({ patientId:'', amount:'' });
  };

  const billFromAppointment = (appt) => {
    const newInv = {
      id:      'INV-' + (1047 + invoices.length),
      pid:     appt.pid,
      patient: appt.patient,
      date:    new Date().toISOString().split('T')[0],
      amount:  0, paid: 0, status: 'Unpaid', payMethod:'',
      apptId:  appt.id,
      apptRef: appt.doctor + ' — ' + appt.dept + ' — ' + appt.date,
    };
    setInvoices(prev => [newInv, ...prev]);
    setBilledApptIds(prev => [...prev, appt.id]);
    setCompletedAppts(prev => prev.filter(a => a.id !== appt.id));
    flash('✅ Invoice created for ' + appt.patient + '. Set the amount and process payment.');
    setActiveTab('invoices');
  };

  const sb = (s) => s === 'Paid' ? 'badge-success' : s === 'Partial' ? 'badge-warning' : 'badge-danger';
  const tabStyle = (t) => ({
    padding:'8px 16px', fontSize:13, cursor:'pointer', border:'none',
    borderBottom: activeTab === t ? '2px solid #4f46e5' : '2px solid transparent',
    background:'transparent',
    color: activeTab === t ? '#4f46e5' : '#6b7280',
    fontWeight: activeTab === t ? 600 : 400,
  });

  const patientInsurance = INIT_PATIENTS.find(p => p.id === 'P-001')?.insurance || '';

  return (
    <div>
      {isPatient && (
        <div className="alert alert-info">
          🔒 Showing your invoices. Pay using cash, card, or insurance.
        </div>
      )}
      {successMsg && <div className="alert alert-info">{successMsg}</div>}

      {!isPatient && (
        <div className="stats-row">
          <div className="stat-card"><div className="stat-label">Total Billed</div><div className="stat-value">${total.toLocaleString()}</div></div>
          <div className="stat-card"><div className="stat-label">Collected</div><div className="stat-value">${collected.toLocaleString()}</div></div>
          <div className="stat-card"><div className="stat-label">Outstanding</div><div className="stat-value">${(total-collected).toLocaleString()}</div></div>
          <div className="stat-card">
            <div className="stat-label">Ready to Bill</div>
            <div className="stat-value" style={{ color: completedAppts.length > 0 ? '#d97706' : undefined }}>{completedAppts.length}</div>
          </div>
        </div>
      )}

      {isPatient && (
        <div className="stats-row">
          <div className="stat-card"><div className="stat-label">Total Invoices</div><div className="stat-value">{myInvoices.length}</div></div>
          <div className="stat-card"><div className="stat-label">Total Billed</div><div className="stat-value">${total.toLocaleString()}</div></div>
          <div className="stat-card"><div className="stat-label">Amount Paid</div><div className="stat-value">${collected.toLocaleString()}</div></div>
          <div className="stat-card">
            <div className="stat-label">Balance Due</div>
            <div className="stat-value" style={{ color: (total-collected) > 0 ? '#dc2626' : '#059669' }}>
              ${(total-collected).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {isPatient && patientInsurance && (
        <div className="card card-body mb-4" style={{ display:'flex', alignItems:'center', gap:12, fontSize:13 }}>
          <span style={{ fontSize:20 }}>🏥</span>
          <div>
            <div style={{ fontWeight:600, marginBottom:2 }}>Insurance on file</div>
            <div style={{ color:'#6b7280' }}>{patientInsurance} — You can use this to pay eligible invoices.</div>
          </div>
        </div>
      )}

      {canWrite && completedAppts.length > 0 && (
        <div className="alert alert-warning">
          ⚠️ {completedAppts.length} completed appointment{completedAppts.length > 1 ? 's' : ''} ready to be billed. Go to the <strong>Ready to Bill</strong> tab.
        </div>
      )}

      {canWrite && (
        <div style={{ display:'flex', borderBottom:'1px solid #e8eaf0', marginBottom:16 }}>
          <button style={tabStyle('invoices')} onClick={() => setActiveTab('invoices')}>
            All Invoices {myInvoices.length > 0 && <span className="badge badge-neutral" style={{ marginLeft:6 }}>{myInvoices.length}</span>}
          </button>
          <button style={tabStyle('ready')} onClick={() => setActiveTab('ready')}>
            Ready to Bill {completedAppts.length > 0 && <span className="badge badge-warning" style={{ marginLeft:6 }}>{completedAppts.length}</span>}
          </button>
        </div>
      )}

      {activeTab === 'ready' && canWrite && (
        <div>
          <div className="section-header"><span className="section-title">Completed Appointments — Ready to Bill</span></div>
          {completedAppts.length === 0 ? (
            <div className="card card-body" style={{ textAlign:'center', color:'#9ca3af', padding:32 }}>No completed appointments waiting to be billed.</div>
          ) : (
            <div className="card">
              <table>
                <thead><tr><th>Appt ID</th><th>Patient</th><th>Doctor</th><th>Department</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {completedAppts.map(appt => (
                    <tr key={appt.id}>
                      <td className="mono">{appt.id}</td>
                      <td>{appt.patient}</td>
                      <td>{appt.doctor}</td>
                      <td>{appt.dept}</td>
                      <td>{appt.date}</td>
                      <td><button className="btn btn-primary btn-sm" onClick={() => billFromAppointment(appt)}>Generate Invoice</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {(activeTab === 'invoices' || isPatient) && (
        <div>
          <div className="section-header">
            <span className="section-title">{isPatient ? 'Your Invoices' : 'All Invoices'}</span>
            {canWrite && <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ New Invoice</button>}
          </div>

          {showForm && canWrite && (
            <div className="card card-body mb-4">
              <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>Generate Invoice</div>
              <form onSubmit={handleNewInvoice}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Patient</label>
                    <select value={form.patientId} onChange={e => setForm({...form, patientId:e.target.value})} required>
                      <option value="">Select patient</option>
                      {INIT_PATIENTS.map(p => (
                        <option key={p.id} value={p.id}>{p.name} — {p.insurance}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Amount ($)</label>
                    <input type="number" min="1" placeholder="e.g. 500" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} required />
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
                    <th>Date</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myInvoices.map(inv => (
                    <tr key={inv.id}>
                      <td>
                        <span className="mono">{inv.id}</span>
                        {inv.apptRef && <div style={{ fontSize:10, color:'#9ca3af', marginTop:2 }}>Ref: {inv.apptRef}</div>}
                        {inv.payMethod && <div style={{ fontSize:10, color:'#059669', marginTop:2 }}>Paid via {inv.payMethod}</div>}
                      </td>
                      {!isPatient && <td>{inv.patient}</td>}
                      <td>{inv.date}</td>
                      <td>
                        {inv.amount === 0 && canWrite ? (
                          <input type="number" min="1" placeholder="Set amount"
                            style={{ width:100, padding:'3px 6px', fontSize:12, border:'1px solid #e8eaf0', borderRadius:6 }}
                            onBlur={e => {
                              const amt = Number(e.target.value);
                              if (amt > 0) setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, amount:amt } : i));
                            }} />
                        ) : '$' + inv.amount.toLocaleString()}
                      </td>
                      <td>${inv.paid.toLocaleString()}</td>
                      <td>${(inv.amount - inv.paid).toLocaleString()}</td>
                      <td><span className={'badge ' + sb(inv.status)}>{inv.status}</span></td>
                      <td>
                        {inv.status !== 'Paid' && inv.amount > 0 && payId !== inv.id && (
                          <button className="btn btn-sm" onClick={() => { setPayId(inv.id); setPayMethod(''); setCardStep('form'); setInsuranceStep('form'); }}>
                            {isPatient ? 'Pay Now' : 'Process Payment'}
                          </button>
                        )}

                        {payId === inv.id && payMethod === '' && (
                          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                            <div style={{ fontSize:12, color:'#6b7280' }}>Select payment method:</div>
                            <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                              <input type="number" min="1" placeholder="Amount $" value={payAmount}
                                onChange={e => setPayAmount(e.target.value)}
                                style={{ width:100, padding:'5px 8px', fontSize:12, border:'1px solid #e8eaf0', borderRadius:6 }} />
                              <button className="btn btn-sm" onClick={() => setPayMethod('cash')}>💵 Cash</button>
                              <button className="btn btn-sm" onClick={() => setPayMethod('card')}>💳 Card</button>
                              <button className="btn btn-sm" onClick={() => setPayMethod('insurance')}>🏥 Insurance</button>
                              <button className="btn btn-sm" onClick={resetPay}>✕</button>
                            </div>
                          </div>
                        )}

                        {payId === inv.id && payMethod === 'cash' && (
                          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                            <span style={{ fontSize:12, color:'#6b7280' }}>Cash: ${Number(payAmount).toLocaleString()}</span>
                            <button className="btn btn-primary btn-sm" onClick={() => handleCash(inv.id)}>Confirm</button>
                            <button className="btn btn-sm" onClick={resetPay}>✕</button>
                          </div>
                        )}
                        {payId === inv.id && payMethod === 'card' && cardStep === 'form'       && <span style={{ fontSize:12, color:'#4f46e5' }}>Fill card form below ↓</span>}
                        {payId === inv.id && payMethod === 'card' && cardStep === 'processing' && <span style={{ fontSize:12, color:'#d97706' }}>⏳ Processing card...</span>}
                        {payId === inv.id && payMethod === 'card' && cardStep === 'success'    && <span style={{ fontSize:12, color:'#059669' }}>✅ Card authorized</span>}
                        {payId === inv.id && payMethod === 'insurance' && insuranceStep === 'form'       && <span style={{ fontSize:12, color:'#9333ea' }}>Fill insurance form below ↓</span>}
                        {payId === inv.id && payMethod === 'insurance' && insuranceStep === 'processing' && <span style={{ fontSize:12, color:'#d97706' }}>⏳ Verifying claim...</span>}
                        {payId === inv.id && payMethod === 'insurance' && insuranceStep === 'success'    && <span style={{ fontSize:12, color:'#059669' }}>✅ Claim approved</span>}
                      </td>
                    </tr>
                  ))}
                  {myInvoices.length === 0 && (
                    <tr><td colSpan="8" style={{ textAlign:'center', color:'#9ca3af', padding:24 }}>No invoices found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {payId && payMethod === 'card' && cardStep === 'form' && (
            <div style={{ marginTop:16 }}>
              <div className="card card-body">
                <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>💳 Card Payment — {invoices.find(i => i.id === payId)?.patient}</div>
                {cardError && <div className="alert" style={{ background:'#fef2f2', color:'#dc2626', marginBottom:12 }}>❌ {cardError}</div>}
                <form onSubmit={handleCardSubmit}>
                  <div className="form-grid">
                    <div className="form-group full">
                      <label>Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" value={card.number}
                        onChange={e => setCard({...card, number:fmtCard(e.target.value)})}
                        maxLength={19} style={{ fontFamily:'monospace', fontSize:15, letterSpacing:2 }} required />
                    </div>
                    <div className="form-group full">
                      <label>Cardholder Name</label>
                      <input type="text" placeholder="Name as it appears on card" value={card.name}
                        onChange={e => setCard({...card, name:e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input type="text" placeholder="MM/YY" value={card.expiry}
                        onChange={e => setCard({...card, expiry:fmtExp(e.target.value)})} maxLength={5} required />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input type="password" placeholder="•••" value={card.cvv}
                        onChange={e => setCard({...card, cvv:e.target.value.replace(/\D/g,'').slice(0,3)})} maxLength={3} required />
                    </div>
                  </div>
                  <div style={{ margin:'10px 0 14px', padding:'10px 12px', background:'#f9fafb', borderRadius:8, fontSize:12, color:'#6b7280' }}>
                    💡 Demo: use any 16-digit number, future expiry date, and any 3-digit CVV.
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button type="submit" className="btn btn-primary">Authorize ${Number(payAmount).toLocaleString()}</button>
                    <button type="button" className="btn" onClick={resetPay}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {payId && payMethod === 'card' && cardStep === 'processing' && (
            <div style={{ marginTop:16 }}>
              <div className="card card-body" style={{ textAlign:'center', padding:'32px 0' }}>
                <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
                <div style={{ fontWeight:600, fontSize:14, marginBottom:6 }}>Processing card payment...</div>
                <div style={{ fontSize:12, color:'#8a8fa8' }}>Contacting card network. Please wait.</div>
              </div>
            </div>
          )}

          {payId && payMethod === 'card' && cardStep === 'success' && (
            <div style={{ marginTop:16 }}>
              <div className="card card-body" style={{ textAlign:'center', padding:'32px 0' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
                <div style={{ fontWeight:700, fontSize:15, color:'#059669', marginBottom:6 }}>Payment Authorized</div>
                <div style={{ fontSize:12, color:'#8a8fa8' }}>
                  ${Number(payAmount).toLocaleString()} charged to card ending in {card.number.slice(-4)}
                </div>
              </div>
            </div>
          )}

          {payId && payMethod === 'insurance' && insuranceStep === 'form' && (
            <div style={{ marginTop:16 }}>
              <div className="card card-body">
                <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>🏥 Insurance Claim — {invoices.find(i => i.id === payId)?.patient}</div>
                {insuranceError && <div className="alert" style={{ background:'#fef2f2', color:'#dc2626', marginBottom:12 }}>❌ {insuranceError}</div>}
                <form onSubmit={handleInsuranceSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Insurance Provider</label>
                      <select value={insuranceForm.provider} onChange={e => setInsuranceForm({...insuranceForm, provider:e.target.value})} required>
                        <option value="">Select provider</option>
                        {INSURANCE_PROVIDERS.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Member ID</label>
                      <input type="text" placeholder="e.g. BCB123456789" value={insuranceForm.memberId}
                        onChange={e => setInsuranceForm({...insuranceForm, memberId:e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Group Number</label>
                      <input type="text" placeholder="e.g. GRP-00123 (optional)" value={insuranceForm.groupNumber}
                        onChange={e => setInsuranceForm({...insuranceForm, groupNumber:e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Claim Amount ($)</label>
                      <input type="number" min="1" placeholder="Amount to claim" value={payAmount}
                        onChange={e => setPayAmount(e.target.value)} required />
                    </div>
                    <div className="form-group full">
                      <label>Notes (optional)</label>
                      <input type="text" placeholder="e.g. Routine checkup, post-op follow-up" value={insuranceForm.notes}
                        onChange={e => setInsuranceForm({...insuranceForm, notes:e.target.value})} />
                    </div>
                  </div>
                  <div style={{ margin:'10px 0 14px', padding:'10px 12px', background:'#fdf4ff', borderRadius:8, fontSize:12, color:'#9333ea' }}>
                    🏥 Demo: enter any member ID and group number. The claim will be verified and approved automatically.
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button type="submit" className="btn" style={{ background:'#9333ea', color:'#fff', border:'none' }}>
                      Submit Insurance Claim
                    </button>
                    <button type="button" className="btn" onClick={resetPay}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {payId && payMethod === 'insurance' && insuranceStep === 'processing' && (
            <div style={{ marginTop:16 }}>
              <div className="card card-body" style={{ textAlign:'center', padding:'32px 0' }}>
                <div style={{ fontSize:32, marginBottom:12 }}>🏥</div>
                <div style={{ fontWeight:600, fontSize:14, marginBottom:6 }}>Verifying insurance claim...</div>
                <div style={{ fontSize:12, color:'#8a8fa8', marginBottom:6 }}>Contacting {insuranceForm.provider}. Please wait.</div>
                <div style={{ fontSize:12, color:'#8a8fa8' }}>Member ID: {insuranceForm.memberId}</div>
              </div>
            </div>
          )}

          {payId && payMethod === 'insurance' && insuranceStep === 'success' && (
            <div style={{ marginTop:16 }}>
              <div className="card card-body" style={{ textAlign:'center', padding:'32px 0' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
                <div style={{ fontWeight:700, fontSize:15, color:'#059669', marginBottom:6 }}>Insurance Claim Approved</div>
                <div style={{ fontSize:12, color:'#8a8fa8', marginBottom:4 }}>
                  ${Number(payAmount).toLocaleString()} covered by {insuranceForm.provider}
                </div>
                <div style={{ fontSize:12, color:'#8a8fa8' }}>Member ID: {insuranceForm.memberId}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
