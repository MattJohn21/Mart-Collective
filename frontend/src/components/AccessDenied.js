import React from 'react';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  admin: 'Administrator', doctor: 'Doctor',
  nurse: 'Nurse', hr: 'HR Staff', patient: 'Patient',
};

export default function AccessDenied({ module }) {
  const { user } = useAuth();
  return (
    <div className="access-denied">
      <div className="icon">🔒</div>
      <h3>Access Restricted</h3>
      <p>
        The <strong>{module}</strong> module is not available for your role (<strong>{ROLE_LABELS[user?.role]}</strong>).
        Contact your administrator if you need access.
      </p>
    </div>
  );
}
