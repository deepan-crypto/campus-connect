const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

async function authenticate(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const [bearer, token] = auth.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Invalid authorization format' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      profile: user.profile
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user && req.user.role;
    if (!role || !allowedRoles.includes(role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = { authenticate, authorizeRoles };
