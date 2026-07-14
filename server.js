const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path'); // Added path module for robust absolute file routing
require('dotenv').config();

const app = express();

// CRITICAL FIX: Middleware to parse incoming JSON request bodies (needed for Login payload)
app.use(express.json());

// Serve static frontend assets cleanly from the public folder using an absolute directory link
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;

// Create database connection pool using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'uitm_user',
  password: process.env.DB_PASSWORD || 'uitm_password',
  database: process.env.DB_NAME || 'uitm_court_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// NEW: Authentic Database Authentication Route
// This route safely queries the database to return the user's real Full Name upon a match
app.post('/api/login', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Note: Change 'full_name', 'USER', 'username', 'email', 'password', and 'role' 
    // to match your exact database column and table names if they differ.
    const [users] = await pool.query(
      'SELECT full_name FROM USER WHERE (username = ? OR email = ?) AND password = ? AND role = ?', 
      [username, username, password, role]
    );

    if (users.length > 0) {
      // Credentials match! Send back the true full name from the database row record
      res.json({ 
        success: true, 
        fullName: users[0].full_name, 
        role: role 
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username, password, or role selection.' });
    }
  } catch (error) {
    console.error('Database Auth Error:', error);
    res.status(500).json({ success: false, message: 'Internal server or database connectivity error.' });
  }
});

// Explicit route to serve the login page when requested
app.get('/login.php', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.php'));
});

// Optional cleaner route alias so http://localhost:3000/login also works seamlessly
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.php'));
});

// Simple test route matching your Core Features (View Court Availability)
app.get('/api/courts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM COURT');
    res.json({ success: true, courts: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Database query failed' });
  }
});

// Modified this from res.send to correctly deliver the index.html landing page instead of a raw text header
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.php'));
});

app.listen(port, () => {
  console.log(`Server executing on http://localhost:${port}`);
});