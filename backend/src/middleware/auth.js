import { verifyAuthToken } from '../utils/token.js';

/**
 * Guards the admin dashboard/API routes. Relies on express-session (see
 * app.js), which sets req.session.adminId on a successful
 * POST /api/admin/login (adminController.login).
 */
export const requireAdmin = (req, res, next) => {
  if (!req.session?.adminId) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  next();
};

export const requireAuth = (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  const token = req.cookies?.token || bearer;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verifyAuthToken(token);
    req.userId = decoded.sub;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session.' });
  }
};
