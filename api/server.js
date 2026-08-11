const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const {createClient} = require('redis');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET","POST"]
    }
});

const subscriber = createClient({ 
    url:'redis://localhost:6379'
});

subscriber.on('error', err => console.error('redis error:',err));

async function startServer() {
    await subscriber.connect();
    console.log("API connected to Redis");
    // Listen for WebSocket connections from the Browser
    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);
        
        socket.emit('connected', { message: 'Connected to GeoTraffic API' });
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    await subscriber.subscribe('live-traffic',(message) => {
        const event = JSON.parse(message);
        console.log(`broadcasting event ${event.type}`);

        io.emit('new-event',event);
    });

    const PORT = 4000;
    server.listen(PORT, () => {
        console.log(`API Server running on http://localhost:${PORT}`);
    });
}

startServer().catch(console.error);



