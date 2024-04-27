const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

app.use('/home', express.static(path.join(__dirname, 'home')));

// MySQL database configuration
// host: 'mysql-service.jp947689.svc.cluster.local' --- When using kubernetes
const db = mysql.createConnection({
  host: 'mysql1',
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
        req.session.user = {
          username: user.username,
        };

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

// Handle form submission for bank data
app.post('/submit-bank-data', (req, res) => {
  const { userBank, userName, userPassword } = req.body;
  console.log("UserBank: " + userBank);
  console.log("UserBank: " + userName);
  console.log("UserBank: " + userPassword);

  try {
    // Insert bank data into MySQL
    const insertBankDataQuery = 'INSERT INTO bankingInfo (bank, username, password) VALUES (?, ?, ?)';
    db.query(insertBankDataQuery, [userBank, userName, userPassword], (err, result) => {
      if (err) {
        console.error('Error inserting bank data: ' + err.stack);
        res.status(500).send('Error inserting bank data');
        return;
      }
      console.log('Bank data inserted: ', result);
      // Send a success message back to the client
      res.send('Bank data submitted successfully!');
    });
  } catch (error) {
    console.error('Error submitting bank data: ' + error.stack);
    res.status(500).send('Error submitting bank data');
  }

  getUserBalance();
});

// Endpoint to get current username
app.get('/get-username', (req, res) => {
  const username = req.session.user.username;
  res.send(username);
});
/////////////////////////////////////////Fetch data from bank server/////////////////////////////////////////////////////

// Define the URL of your FastAPI server
const apiUrl = 'http://172.18.0.3:8000';


// Define the credentials for authentication
const credentials = new URLSearchParams();
credentials.append('username', 'user1');
credentials.append('password', 'password');

// Function to get user balance
async function getUserBalance() {
  try {
    const tokenResponse = await axios.post(`${apiUrl}/token`, credentials);
    if (!tokenResponse || !tokenResponse.data || !tokenResponse.data.access_token) {
      throw new Error('Failed to obtain access token');
    }
    const accessToken = tokenResponse.data.access_token;

    // Make request to userbalance endpoint with the access token
    const response = await axios.get(`${apiUrl}/userbalance`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Log the user balance
    console.log(response.data);
  } catch (error) {
    // Handle errors
    console.error('Error:', error.message);
  }
}

// Call the function to get user balance
getUserBalance();




/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});