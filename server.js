const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serves your index.html

// --- IN-MEMORY DATABASE (Resets if server restarts) ---
// Note: For permanent storage on Render, you would normally need a real database like MongoDB.
// For this simple demo, we use variables. Data will be lost if Render puts the server to sleep.
let users = []; 
let squads = {};

// --- ROUTES ---

// 1. serve the HTML file on the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. Register Endpoint
app.post('/register', (req, res) => {
    const { sc, name, password } = req.body;

    // Check if user exists
    if (users.find(u => u.sc === sc)) {
        return res.json({ status: "error", message: "User already exists" });
    }

    users.push({ sc, name, password });
    // Initialize empty squad for new user
    squads[sc] = { squad: null, captain: null }; 

    console.log(`New user registered: ${sc}`);
    res.json({ status: "ok" });
});

// 3. Login Endpoint
app.post('/login', (req, res) => {
    const { sc, password } = req.body;
    const user = users.find(u => u.sc === sc && u.password === password);

    if (user) {
        res.json({ status: "ok", name: user.name });
    } else {
        res.status(401).json({ status: "error", message: "Invalid credentials" });
    }
});

// 4. Save Squad Endpoint
app.post('/save_squad', (req, res) => {
    const { sc, squad, captain } = req.body;

    // Update user squad data
    if(squads[sc] || users.find(u => u.sc === sc)) {
         squads[sc] = { 
            squad: JSON.parse(squad), 
            captain: captain 
        };
        console.log(`Squad updated for ${sc}`);
        res.json({ status: "ok" });
    } else {
        res.status(404).json({ status: "error", message: "User not found" });
    }
});

// 5. Leaderboard Endpoint
app.get('/leaderboard', (req, res) => {
    // Return list of all registered SC codes so frontend can calculate points
    // In a real app, you might calculate points here on the server
    const userList = users.map(u => ({
        sc: u.sc,
        name: u.name
    }));
    res.json(userList);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
