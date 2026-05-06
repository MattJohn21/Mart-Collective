const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'medcore-dev-secret-change-in-production';

// Define what each role can access
const ROLE_PERMISSIONS = {
  admin: {
    modules: ['dashboard', 'billing', 'hr', 'scheduling', 'registration'],
    billing: ['read', 'write', 'delete'],
    hr: ['read', 'write', 'delete', 'view_salary'],
    scheduling: ['read', 'write', 'delete'],
    registration: ['read', 'write', 'delete'],
  },
  doctor: {
    modules: ['dashboard', 'scheduling', 'registration'],
    scheduling: ['read', 'write'],
    registration: ['read', 'write'],
  },
  nurse: {
    modules: ['dashboard', 'scheduling', 'registration'],
    scheduling: ['read'],
    registration: ['read'],
  },
  hr: {
    modules: ['dashboard', 'hr'],
    hr: ['read', 'write'],
  },
  patient: {
    modules: ['dashboard', 'billing', 'scheduling'],
    billing: ['read_own'],
    scheduling: ['read_own', 'request'],
  },
};

// Middleware: verify JWT token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Middleware factory: require specific module + permission
function authorize(module, permission) {
  return (req, res, next) => {
    const role = req.user?.role;
    const perms = ROLE_PERMISSIONS[role];
    if (!perms) return res.status(403).json({ error: 'Unknown role' });

    const hasModule = perms.modules.includes(module);
    const modulePerms = perms[module] || [];
    const hasPerm = modulePerms.includes(permission);

    if (!hasModule || !hasPerm) {
      return res.status(403).json({
        error: `Role '${role}' does not have '${permission}' permission on '${module}'`,
      });
    }
    next();
  };
}

// Middleware: check if patient is accessing only their own data
function ownDataOnly(req, res, next) {
  if (req.user.role === 'patient') {
    req.filterByUserId = req.user.id;
  }
  next();
}

module.exports = { authenticate, authorize, ownDataOnly, ROLE_PERMISSIONS, JWT_SECRET };
