import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Billing() {
  const { user, hasPermission } = useAuth();
  const [invoices, setInvoices]   = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const isPatient = user?.role === 'patient';
  const canWrite  = hasPermission('billing', 'write');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes] = await Promise.all([axios.get('/api/billing')]);
        setInvoices(invRes.data);
        if (!isPatient) {
          const sumRes = await axios.get('/api/billing/summary');
          setSummary(sumRes.data);
        }
      } catch (e) {
        setError('Failed to load billing data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isPatient]);

  const handlePay = async (id) => {
    const amount = prompt('Enter payment amount:');
    if (!amount || isNaN(amount)) return;
    try {
      const res = await axios.patch(`/api/billing/${id}/pay`, { amount: Number(amount) });
      setInvoices(prev => prev.map(i => i.id === id ? res.data : i));
    } catch (e) {
      alert(e.response?.data?.error || 'Payment failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await axios.delete(`/api/billing/${id}`);
      setInvoices(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      alert(e.response?.data?.error || 'Delete failed');
    }
  };

  if (loading) return <div className="loading">Loading billing data...</div>;

  const statusBadge = (s) =>
    s === 'Paid' ? 'badge-success' : s === 'Partial' ? 'badge-warning' : 'badge-danger';

  return (
    <div>
      {isPatient && (
        <div className="alert alert-info">
          🔒 You can view your invoices. To dispute a charge, contact billing staff.
        </div>
      )}

      {!isPatient && summary && (
        <div className="stats-row">
          <div className="stat-card"><div className="stat-label">Total Billed</div><div className="stat-value">${summary.total.toLocaleString()}</div></div>
          <div className="stat-card"><div className="stat-label">Collected</div><div className="stat-value">${summary.collected.toLocaleString()}</div></div>
          <div className="stat-card"><div className="stat-label">Outstanding</div><div className="stat-value">${summary.outstanding.toLocaleString()}</div></div>
          <div className="stat-card"><div className="stat-label">Unpaid Invoices</div><div className="stat-value">{summary.overdue}</div></div>
        </div>
      )}

      <div className="section-header">
        <span className="section-title">{isPatient ? 'Your Invoices' : 'All Invoices'}</span>
        {canWrite && (
          <button className="btn btn-primary btn-sm">+ New Invoice</button>
        )}
      </div>

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
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="mono">{inv.id}</td>
                  {!isPatient && <td>{inv.patient}</td>}
                  <td>{inv.date}</td>
                  <td>${inv.amount.toLocaleString()}</td>
                  <td>${inv.paid.toLocaleString()}</td>
                  <td>${(inv.amount - inv.paid).toLocaleString()}</td>
                  <td><span className={`badge ${statusBadge(inv.status)}`}>{inv.status}</span></td>
                  {canWrite && (
                    <td>
                      <div className="flex gap-8">
                        {inv.status !== 'Paid' && (
                          <button className="btn btn-sm" onClick={() => handlePay(inv.id)}>Pay</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inv.id)}>Delete</button>
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
