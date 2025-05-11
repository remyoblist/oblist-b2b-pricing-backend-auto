const express = require("express");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/tokenUtils");
const { authenticateToken } = require("../middlewares/auth.middleware")

const router = express.Router();

// Mock user database
const users = [
  {
    id: 1,
    email: "remy@oblist.com",
    passwordHash: bcrypt.hashSync("$%6Million", 10),
  },
  {
    id: 2,
    email: "contact@oblist.com",
    passwordHash: bcrypt.hashSync("%^7Billion", 10),
  },
];

// Login route
router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Generate token
  const token = generateToken(user.id, user.email);

  res.json({ token });
});

// Protected route example
router.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

module.exports = router;
