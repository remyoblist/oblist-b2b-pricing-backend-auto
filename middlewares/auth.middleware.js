const jwt = require("jsonwebtoken");

// Secret key for JWT (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header is present
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }

  const token = authHeader.split(" ")[1];  // Extract token from "Bearer <token>"

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded user data to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Invalid token. Access denied." });
  }
};

module.exports = {
  authenticateToken,
};
