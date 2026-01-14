import jwt from 'jsonwebtoken';

// ========== PROTECT MIDDLEWARE ==========
// This middleware verifies JWT and extracts user ID
export const protect = (req, res, next) => {
  try {
    // Step 1: Get JWT token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    // Step 2: Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'No token provided. Please login.' });
    }

    // Step 3: Verify token using SECRET_KEY
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: Extract user ID from decoded token
    // decoded = { id: "123", iat: 1234567, exp: 7234567 }
    req.userId = decoded.id;

    // Step 5: Pass control to next middleware/controller
    next();
  } catch (err) {
    // Token is invalid or expired
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ message: 'Invalid token. Please login.' });
  }
};