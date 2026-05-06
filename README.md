# MedCore HMS — Healthcare Management System

A full-stack healthcare management system with role-based access control built with React + Node/Express.

## Modules
| Module | Admin | Doctor | Nurse | HR Staff | Patient |
|--------|-------|--------|-------|----------|---------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Billing | ✅ Full | ❌ | ❌ | ❌ | ✅ Own only |
| Human Resources | ✅ Full + Salary | ❌ | ❌ | ✅ No salary | ❌ |
| Scheduling | ✅ Full | ✅ Own patients | ✅ View only | ❌ | ✅ Own only |
| Registration | ✅ Full | ✅ Read + Write | ✅ View only | ❌ | ❌ |

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@medcore.com | admin123 |
| Doctor | doctor@medcore.com | doctor123 |
| Nurse | nurse@medcore.com | nurse123 |
| HR Staff | hr@medcore.com | hr123 |
| Patient | patient@medcore.com | patient123 |

---

## Local Development

### 1. Backend
```bash
cd backend
npm install
npm run dev        # runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm start          # runs on http://localhost:3000
```

The frontend proxies `/api` requests to `localhost:5000` automatically.

---

## Deployment

### Frontend → Vercel
1. Push project to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set **Root Directory** to `frontend`
4. Set environment variable: `REACT_APP_API_URL=https://your-render-app.onrender.com`
5. Deploy — get a live URL like `medcore.vercel.app`

### Backend → Render
1. Go to [render.com](https://render.com) → New Web Service → Connect GitHub repo
2. Set **Root Directory** to `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variable: `JWT_SECRET=your-strong-secret-here`
6. Deploy — get a URL like `medcore-api.onrender.com`

### After deploying both:
Update `frontend/src` — replace the `proxy` in `package.json` with your Render URL for production builds, or set `REACT_APP_API_URL` in Vercel environment variables and update your axios base URL.

---

## Project Structure
```
medcore/
├── backend/
│   ├── server.js              # Express entry point
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js            # JWT auth + role permission middleware
│   ├── routes/
│   │   ├── auth.js            # POST /login, GET /me
│   │   ├── billing.js         # CRUD for invoices
│   │   ├── hr.js              # CRUD for staff
│   │   ├── scheduling.js      # CRUD for appointments
│   │   └── registration.js    # CRUD for patients
│   └── data/
│       └── mockData.js        # In-memory data (replace with DB)
│
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js             # Routes + role-protected route wrappers
        ├── App.css            # Global styles
        ├── index.js
        ├── context/
        │   └── AuthContext.js # Global auth state + login/logout
        ├── components/
        │   ├── Login.js       # Login page with demo accounts
        │   ├── Layout.js      # Sidebar + topbar shell
        │   └── AccessDenied.js
        └── modules/
            ├── Dashboard/Dashboard.js
            ├── Billing/Billing.js
            ├── HR/HR.js
            ├── Scheduling/Scheduling.js
            └── Registration/Registration.js
```

## Next Steps (to make it production-ready)
- Replace `mockData.js` with a real PostgreSQL/Supabase database
- Add input validation with a library like `express-validator`
- Add password hashing on registration (already done for demo accounts)
- Add a real `.env` file for secrets (never commit JWT_SECRET)
- Add pagination to tables
- Add a real form for creating new invoices, appointments, staff
