const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { users } = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ error: "Email already registered" });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), name, email, password: hashed, role: "customer" };
  users.push(user);
  const { password: _, ...safe } = user;
  res.status(201).json({ message: "User registered", user: safe });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  const user = users.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
