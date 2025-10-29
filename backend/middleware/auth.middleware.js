const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    token = token.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded token:", decoded);
    req.user = {
      ...decoded,
      id: decoded.id || decoded._id,
      _id: decoded._id || decoded.id
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
};

const isTeacher = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    return next();
  } else {
    return res.status(403).json({ message: 'Not authorized as teacher' });
  }
};

const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  } else {
    return res.status(403).json({ message: 'Not authorized as student' });
  }
};

module.exports = {protect,isAdmin,isTeacher,isStudent};
