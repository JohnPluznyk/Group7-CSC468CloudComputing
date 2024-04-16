const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 3000;

app.use('/home', express.static(path.join(__dirname, 'home')));

// MySQL database configuration
const db = mysql.createConnection({
  host: 'mysql-service.jp947689.svc.cluster.local',
  user: 'john',
  password: 'password',
  database: 'FusionBank',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + db.threadId);
});

// Middleware
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Serve HTML form for signup
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rest of routes

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('username after destructring:', username);
  console.log('Password after destructring:', password);

  try {
    // Check if the username already exists (existing code)
    // ...

    const saltRounds = 10; // Adjust the cost factor as needed

    try {
      const salt = await bcrypt.genSalt(saltRounds);
      console.log('Password before hashing:', password);
      console.log('Generated salt:', salt);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert data into MySQL (use hashedPassword)
      const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.query(insertUserQuery, [username, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error inserting record: ' + err.stack);
          res.status(500).send('Error inserting record');
          return;
        }
        console.log('Record inserted: ', result);
        // Send a success message back to the client
        res.send('User registered successfully!');
      });
    } catch (error) {
      console.error('Error hashing password: ' + error.stack);
      res.status(500).send('Error registering user');
    }
  } catch (error) {
    console.error('Error registering user: ' + error.stack);
    res.status(500).send('Error registering user');
  }
});



// Handle form submission for user login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query the database to get user by username
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
      if (err) {
        console.error('Error querying database: ' + err.stack);
        res.status(500).send('Error querying database');
        return;
      }

      if (results.length === 0) {
        res.status(401).send('Invalid username or password');
        return;
      }

      // Compare the provided password with the hashed password
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        // Store user data in session
        req.session.user = user;
        res.sendFile(path.join(__dirname, 'home', 'home.html'));
      } else {
        res.status(401).send('Invalid username or password');
      }
    });
  } catch (error) {
    console.error('Error logging in: ' + error.stack);
    res.status(500).send('Error logging in');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

