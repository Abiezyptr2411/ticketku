require('dotenv').config();
const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const socketManager = require('./src/sockets/socketManager');
socketManager(io);

const connectDB = require('./src/config/db');

app.set('io', io);

// Database connection
connectDB();

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
