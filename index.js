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

// Dummy user (hardcoded for demo)
const DUMMY_USER = {
  email: 'test@example.com',
  password: 'password123',
};

// Secret key for signing JWT (in real apps, keep this in .env)
const JWT_SECRET = 'supersecretkey';

// Login route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Check against dummy data
  if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
    // Create JWT payload
    const payload = { email };

    // Sign JWT (expires in 1h)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    return res.json({
      message: 'Login successful',
      token,
    });
  }

  // Invalid credentials
  return res.status(401).json({ error: 'Invalid email or password' });
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
