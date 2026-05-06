const bcrypt = require('bcryptjs');

const users = [
  { id: 1, name: 'Alex Admin',     email: 'admin@medcore.com',   password: bcrypt.hashSync('admin123', 10),   role: 'admin',   patientId: null },
  { id: 2, name: 'Dr. Sarah Chen', email: 'doctor@medcore.com',  password: bcrypt.hashSync('doctor123', 10),  role: 'doctor',  patientId: null },
  { id: 3, name: 'Mark Phillips',  email: 'nurse@medcore.com',   password: bcrypt.hashSync('nurse123', 10),   role: 'nurse',   patientId: null },
  { id: 4, name: 'Tanya Brooks',   email: 'hr@medcore.com',      password: bcrypt.hashSync('hr123', 10),      role: 'hr',      patientId: null },
  { id: 5, name: 'Alice Monroe',   email: 'patient@medcore.com', password: bcrypt.hashSync('patient123', 10), role: 'patient', patientId: 'P-001' },
];

const patients = [
  { id: 'P-001', name: 'Alice Monroe',  dob: '1985-03-12', dept: 'Cardiology',  status: 'Admitted',   insurance: 'BlueCross', userId: 5 },
  { id: 'P-002', name: 'Robert Chan',   dob: '1972-07-28', dept: 'Orthopedics', status: 'Outpatient', insurance: 'Aetna',     userId: null },
  { id: 'P-003', name: 'Sandra Miller', dob: '1990-11-04', dept: 'Neurology',   status: 'Discharged', insurance: 'UHC',       userId: null },
  { id: 'P-004', name: 'James Okafor',  dob: '2001-02-19', dept: 'Emergency',   status: 'Admitted',   insurance: 'Medicaid',  userId: null },
  { id: 'P-005', name: 'Priya Sharma',  dob: '1968-09-30', dept: 'Oncology',    status: 'Outpatient', insurance: 'Cigna',     userId: null },
];

const invoices = [
  { id: 'INV-1042', patientId: 'P-001', patient: 'Alice Monroe',  date: '2026-04-28', amount: 1250, paid: 930,  status: 'Partial' },
  { id: 'INV-1043', patientId: 'P-002', patient: 'Robert Chan',   date: '2026-05-01', amount: 800,  paid: 800,  status: 'Paid'    },
  { id: 'INV-1044', patientId: 'P-003', patient: 'Sandra Miller', date: '2026-05-02', amount: 600,  paid: 450,  status: 'Partial' },
  { id: 'INV-1045', patientId: 'P-004', patient: 'James Okafor',  date: '2026-05-04', amount: 2100, paid: 0,    status: 'Unpaid'  },
  { id: 'INV-1046', patientId: 'P-005', patient: 'Priya Sharma',  date: '2026-05-05', amount: 3400, paid: 2900, status: 'Partial' },
];

const staff = [
  { id: 'E-201', name: 'Dr. Sarah Chen',  role: 'Doctor', dept: 'Cardiology', status: 'Active', salary: 195000, start: '2019-01-15' },
  { id: 'E-202', name: 'Mark Phillips',   role: 'Nurse',  dept: 'Pediatrics', status: 'Active', salary: 78000,  start: '2021-03-08' },
  { id: 'E-203', name: 'Tanya Brooks',    role: 'HR',     dept: 'HR',         status: 'Active', salary: 65000,  start: '2020-07-20' },
  { id: 'E-204', name: 'Dr. Alan Torres', role: 'Doctor', dept: 'Neurology',  status: 'Leave',  salary: 210000, start: '2017-05-12' },
  { id: 'E-205', name: 'Nina Walsh',      role: 'Nurse',  dept: 'Emergency',  status: 'Active', salary: 82000,  start: '2022-09-01' },
  { id: 'E-206', name: 'Dr. James Osei',  role: 'Doctor', dept: 'Oncology',   status: 'Active', salary: 225000, start: '2015-11-03' },
];

const appointments = [
  { id: 'APT-001', patientId: 'P-001', patientName: 'Alice Monroe',  doctor: 'Dr. Sarah Chen',  dept: 'Cardiology',  date: '2026-05-09', time: '10:00 AM', status: 'Confirmed' },
  { id: 'APT-002', patientId: 'P-002', patientName: 'Robert Chan',   doctor: 'Dr. Alan Torres', dept: 'Neurology',   date: '2026-05-07', time: '9:00 AM',  status: 'Confirmed' },
  { id: 'APT-003', patientId: 'P-003', patientName: 'Sandra Miller', doctor: 'Dr. James Osei',  dept: 'Oncology',    date: '2026-05-08', time: '2:00 PM',  status: 'Pending'   },
  { id: 'APT-004', patientId: 'P-004', patientName: 'James Okafor',  doctor: 'Dr. Sarah Chen',  dept: 'Cardiology',  date: '2026-05-10', time: '11:00 AM', status: 'Confirmed' },
  { id: 'APT-005', patientId: 'P-005', patientName: 'Priya Sharma',  doctor: 'Dr. James Osei',  dept: 'Oncology',    date: '2026-05-22', time: '2:30 PM',  status: 'Pending'   },
  { id: 'APT-006', patientId: 'P-001', patientName: 'Alice Monroe',  doctor: 'Dr. Alan Torres', dept: 'Neurology',   date: '2026-05-22', time: '2:30 PM',  status: 'Pending'   },
];

module.exports = { users, patients, invoices, staff, appointments };
