const jwt = require("jsonwebtoken");

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Function to generate JWT
const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },    // Payload with user info
    JWT_SECRET,               // Secret key
    { expiresIn: "1h" }       // Token expiration (1 hour)
  );
};

module.exports = {
  generateToken,
};
