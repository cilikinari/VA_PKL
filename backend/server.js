require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Import Routes
const chat_routes = require('./routes/chat_routes');
const admin_routes = require('./routes/admin_routes');

// Middleware
app.use(cors());
app.use(express.json());

// Gunakan Routes
app.use('/api', chat_routes);
app.use('/api/admin', admin_routes);

// Jalankan Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server Express nyala di http://localhost:${PORT}`);
});