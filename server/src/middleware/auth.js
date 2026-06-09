import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised, no token' });
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Not authorised, invalid token' });
  }
  req.user = await User.findById(decoded.id).select('-password');

  if (!req.user) {
    return res.status(401).json({ message: 'Not authorised, user not found' });
  }

  next();
};

export default protect;
