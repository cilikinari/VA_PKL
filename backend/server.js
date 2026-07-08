const listEndpoints = require('express-list-endpoints');
const express = require('express');
const cors = require('cors');

const app = express();
// HAPUS baris: app.use(listEndpoints);

// Import Routes
const chat_routes = require('./routes/chat_routes');

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api', chat_routes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server Express nyala di http://localhost:${PORT}`);
    console.log("Daftar Routes yang tersedia:");
    console.table(listEndpoints(app));
});