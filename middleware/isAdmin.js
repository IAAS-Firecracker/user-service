const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
  
  try {
    const token = req.headers.authorization.split(' ')[1]; //req.headers['authorization'];
  
    if (!token) {
      return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas un administrateur.' });
    }
    req.userData = { userId: decoded.id, userEmail: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Jeton d\'accès invalide' });
  }
};

module.exports = isAdmin;