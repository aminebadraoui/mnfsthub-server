const express = require('express');
const cors = require('cors');
const http = require('http');
const wsServer = require('./websocket');

const app = express();

// Configure CORS
app.use(cors());

app.use(express.json());

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
wsServer.initialize(server, {
    noServer: true,
    perMessageDeflate: false,
    clientTracking: true
});

// Handle upgrade requests
server.on('upgrade', (request, socket, head) => {
    console.log('Received upgrade request from:', request.headers.origin);
    wsServer.wss.handleUpgrade(request, socket, head, (ws) => {
        wsServer.wss.emit('connection', ws, request);
    });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 