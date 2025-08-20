const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// 🔑 Custom CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // allow your frontend
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Simple GET route
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// // Example POST route
// app.post('/echo', (req, res) => {
//   res.json({
//     message: 'You sent:',
//     data: req.body
//   });
// });
// 🗂️ In-memory users array (dummy DB)
const users = [
  { name: 'Test User', email: 'test@example.com', password: 'password123' }
];

// Secret key for signing JWT (in real apps, keep this in .env)
const JWT_SECRET = 'supersecretkey';

// 🔹 Register route
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // Check if email already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Add user to dummy "DB"
  const newUser = { name, email, password };
  users.push(newUser);

  return res.json({
    message: 'User registered successfully',
    user: { name, email }
  });
});

// Login route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Find user in dummy "DB"
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    const token = jwt.sign(
      { email: user.email, name: user.name }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    return res.json({ 
      message: 'Login successful', 
      token,
      name: user.name,
      email: user.email
    });
  }

  res.status(401).json({ error: 'Invalid email or password' });
});

// Example protected route
app.get('/api/protected', (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ message: 'Protected data accessed!', user: decoded });
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running at http://localhost:${PORT}/api`);
});
