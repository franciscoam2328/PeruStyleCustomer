const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Import handlers
const createOrder = require('./api/paypal/create-order');
const captureOrder = require('./api/paypal/capture-order');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.')));

// API Routes
app.post('/api/paypal/create-order', createOrder);
app.post('/api/paypal/capture-order', captureOrder);

// SPA Fallback (for router.js)
app.use((req, res) => {
    // If it's an API call that wasn't matched, 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Not found' });
    }
    // Otherwise serve index.html for client-side routing
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Test your app now!`);
});
