import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const INIT_INVOICES = [
  { id:'INV-1042', pid:'P-001', patient:'Victoria Nguyen',   date:'2026-04-28', amount:1250, paid:930,  status:'Partial' },
  { id:'INV-1043', pid:'P-002', patient:'Harold Bennett',    date:'2026-05-01', amount:800,  paid:800,  status:'Paid'    },
  { id:'INV-1044', pid:'P-003', patient:'Camille Fontaine',  date:'2026-05-02', amount:600,  paid:450,  status:'Partial' },
  { id:'INV-1045', pid:'P-004', patient:'Derrick Lawson',    date:'2026-05-04', amount:2100, paid:0,    status:'Unpaid'  },
  { id:'INV-1046', pid:'P-005', patient:'Ingrid Castellano', date:'2026-05-05', amount:3400, paid:2900, status:'Partial' },
];

const PATIENTS = [
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

  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ patientId:'', amount:'' });
  const [payId, setPayId]             = useState(null);
  const [payAmount, setPayAmount]     = useState('');
  const [payMethod, setPayMethod]     = useState('');
  const [cardStep, setCardStep]       = useState('form');
  const [cardError, setCardError]     = useState('');
  const [card, setCard]               = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [successMsg, setSuccessMsg]   = useState('');

  useEffect(() => {
    localStorage.setItem('mc_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const isPatient = user?.role === 'patient';
  const canWrite  = ['admin','billing'].includes(user?.role);
  const myInvoices = isPatient ? invoices.filter(i => i.pid === 'P-001') : invoices;
  const total      = myInvoices.reduce((s,i) => s + i.amount, 0);
  const collected  = myInvoices.reduce((s,i) => s + i.paid, 0);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  const resetPay = () => {
    setPayId(null);
    setPayAmount('');
    setPayMethod('');
    setCardStep('form');
    setCardError('');
    setCard({ number:'', name:'', expiry:'', cvv:'' });
  };

  const applyPayment = (id, amt, method) => {
    setInvoices(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newPaid = Math.min(i.paid + amt, i.amount);
      return { ...i, paid: newPaid, status: newPaid >= i.amount ? 'Paid' : 'Partial' };
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
    if (raw.length !== 16)     { setCardError('Card number must be 16 digits.'); return; }
    if (!card.name.trim())     { setCardError('Cardholder name is required.'); return; }
    if (card.expiry.length !== 5) { setCardError('Enter expiry as MM/YY.'); return; }
    if (card.cvv.length !== 3) { setCardError('CVV must be 3 digits.'); return; }
    const [mm, yy] = card.expiry.split('/');
    if (new Date(2000 + Number(yy), Number(mm) - 1) < new Date()) {
      setCardError('This card has expired.'); return;
    }
    setCardStep('processing');
    setTimeout(() => {
      setCardStep('success');
      setTimeout(() => applyPayment(payId, Number(payAmount), 'Card'), 1500);
    }, 2000);
  };

  const handleNewInvoice = (e) => {
    e.preventDefault();
    const patient = PATIENTS.find(p => p.id === form.patientId);
    if (!patient) return;
    const newInv = {
      id:      'INV-' + (1047 + invoices.length),
      pid:     form.patientId,
      patient: patient.name,
      date:    new Date().toISOString().split('T')[0],
      amount:  Number(form.amount),
      paid:    0,
      status:  'Unpaid',
    };
    setInvoices(prev => [newInv, ...prev]);
    flash('✅ Invoice ' + newInv.id + ' created for ' + patient.name);
    setShowForm(false);
    setForm({ patientId:'', amount:'' });
  };

  const sb = (s) => s === 'Paid' ? 'badge-success' : s === 'Partial' ? 'badge-warning' : 'badge-danger';

  return (
    <div>
      {isPatient && <div className="alert alert-info">🔒 Showing your invoices only.</div>}
      {successMsg && <div className="alert alert-info">{successMsg}</div>}

      {!isPatient && (
        <div className="stats-row">
          <div className="stat-card"><div className="stat-label">Total Billed</div><div className="stat-value">${total.toLocaleString()}</div></div>
          <div className="stat-card"><div className="stat-label">Collected</div><div className="stat-value">${collected.toLocaleString()}</div></div>
          <div className="stat-card"><div className="stat-label">Outstanding</div><div className="stat-value">${(total-collected).toLocaleString()}</div></div>
          <div className="stat-card"><div className="stat-label">Unpaid</div><div className="stat-value">{myInvoices.filter(i=>i.status==='Unpaid').length}</div></div>
        </div>
      )}

      <div className="section-header">
        <span className="section-title">{isPatient ? 'Your Invoices' : 'All Invoices'}</span>
        {canWrite && <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ New Invoice</button>}
      </div>

      {showForm && (
        <div className="card card-body mb-4">
          <div style={{fontWeight:700,marginBottom:12,fontSize:14}}>Generate Invoice</div>
          <form onSubmit={handleNewInvoice}>
            <div className="form-grid">
              <div className="form-group">
                <label>Patient</label>
                <select value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})} required>
                  <option value="">Select patient</option>
                  {PATIENTS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Amount ($)</label>
                <input type="number" min="1" placeholder="e.g. 500" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/>
              </div>
            </div>
            <div style={{display:'flex',gap:8,marginTop:12}}>
              <button type="submit" className="btn btn-primary">Generate Invoice</button>
              <button type="button" className="btn" onClick={()=>setShowForm(false)}>Cancel</button>
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
                {canWrite && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {myInvoices.map(inv=>(
                <tr key={inv.id}>
                  <td className="mono">{inv.id}</td>
                  {!isPatient && <td>{inv.patient}</td>}
                  <td>{inv.date}</td>
                  <td>${inv.amount.toLocaleString()}</td>
                  <td>${inv.paid.toLocaleString()}</td>
                  <td>${(inv.amount-inv.paid).toLocaleString()}</td>
                  <td><span className={'badge ' + sb(inv.status)}>{inv.status}</span></td>
                  {canWrite && (
                    <td>
                      {inv.status !== 'Paid' && payId !== inv.id && (
                        <button className="btn btn-sm" onClick={()=>{setPayId(inv.id);setPayMethod('');setCardStep('form');}}>
                          Process Payment
                        </button>
                      )}
                      {payId === inv.id && payMethod === '' && (
                        <div style={{display:'flex',flexDirection:'column',gap:8}}>
                          <div style={{display:'flex',gap:6,alignItems:'center'}}>
                            <input type="number" min="1" placeholder="Amount" value={payAmount}
                              onChange={e=>setPayAmount(e.target.value)}
                              style={{width:80,padding:'4px 8px',fontSize:12,border:'1px solid #e8eaf0',borderRadius:6}}/>
                            <button className="btn btn-sm" onClick={()=>setPayMethod('cash')}>💵 Cash</button>
                            <button className="btn btn-sm" onClick={()=>setPayMethod('card')}>💳 Card</button>
                            <button className="btn btn-sm" onClick={resetPay}>✕</button>
                          </div>
                        </div>
                      )}
                      {payId === inv.id && payMethod === 'cash' && (
                        <div style={{display:'flex',gap:6,alignItems:'center'}}>
                          <span style={{fontSize:12,color:'#6b7280'}}>Cash: ${Number(payAmount).toLocaleString()}</span>
                          <button className="btn btn-primary btn-sm" onClick={()=>handleCash(inv.id)}>Confirm</button>
                          <button className="btn btn-sm" onClick={resetPay}>✕</button>
                        </div>
                      )}
                      {payId === inv.id && payMethod === 'card' && cardStep === 'form' && (
                        <span style={{fontSize:12,color:'#4f46e5'}}>Fill card form below ↓</span>
                      )}
                      {payId === inv.id && payMethod === 'card' && cardStep === 'processing' && (
                        <span style={{fontSize:12,color:'#d97706'}}>⏳ Processing...</span>
                      )}
                      {payId === inv.id && payMethod === 'card' && cardStep === 'success' && (
                        <span style={{fontSize:12,color:'#059669'}}>✅ Authorized</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {myInvoices.length === 0 && (
                <tr><td colSpan="8" style={{textAlign:'center',color:'#9ca3af',padding:24}}>No invoices found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {payId && payMethod === 'card' && cardStep === 'form' && (
        <div style={{marginTop:16}}>
          <div className="card card-body">
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>
              💳 Card Payment — {invoices.find(i=>i.id===payId)?.patient}
            </div>
            {cardError && (
              <div className="alert" style={{background:'#fef2f2',color:'#dc2626',marginBottom:12}}>
                ❌ {cardError}
              </div>
            )}
            <form onSubmit={handleCardSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Card Number</label>
                  <input type="text" placeholder="1234 5678 9012 3456"
                    value={card.number}
                    onChange={e=>setCard({...card,number:fmtCard(e.target.value)})}
                    maxLength={19}
                    style={{fontFamily:'monospace',fontSize:15,letterSpacing:2}}
                    required/>
                </div>
                <div className="form-group full">
                  <label>Cardholder Name</label>
                  <input type="text" placeholder="Name as it appears on card"
                    value={card.name}
                    onChange={e=>setCard({...card,name:e.target.value})}
                    required/>
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input type="text" placeholder="MM/YY"
                    value={card.expiry}
                    onChange={e=>setCard({...card,expiry:fmtExp(e.target.value)})}
                    maxLength={5} required/>
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input type="password" placeholder="•••"
                    value={card.cvv}
                    onChange={e=>setCard({...card,cvv:e.target.value.replace(/\D/g,'').slice(0,3)})}
                    maxLength={3} required/>
                </div>
              </div>
              <div style={{margin:'10px 0 14px',padding:'10px 12px',background:'#f9fafb',borderRadius:8,fontSize:12,color:'#6b7280'}}>
                💡 Demo: use any 16-digit number, future expiry, and any 3-digit CVV.
              </div>
              <div style={{display:'flex',gap:8}}>
                <button type="submit" className="btn btn-primary">
                  Authorize ${Number(payAmount).toLocaleString()}
                </button>
                <button type="button" className="btn" onClick={resetPay}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {payId && payMethod === 'card' && cardStep === 'processing' && (
        <div style={{marginTop:16}}>
          <div className="card card-body" style={{textAlign:'center',padding:'32px 0'}}>
            <div style={{fontSize:32,marginBottom:12}}>⏳</div>
            <div style={{fontWeight:600,fontSize:14,marginBottom:6}}>Processing payment...</div>
            <div style={{fontSize:12,color:'#8a8fa8'}}>Contacting card network. Please wait.</div>
          </div>
        </div>
      )}

      {payId && payMethod === 'card' && cardStep === 'success' && (
        <div style={{marginTop:16}}>
          <div className="card card-body" style={{textAlign:'center',padding:'32px 0'}}>
            <div style={{fontSize:40,marginBottom:12}}>✅</div>
            <div style={{fontWeight:700,fontSize:15,color:'#059669',marginBottom:6}}>Payment Authorized</div>
            <div style={{fontSize:12,color:'#8a8fa8'}}>
              ${Number(payAmount).toLocaleString()} charged to card ending in {card.number.slice(-4)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
