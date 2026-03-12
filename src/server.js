import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer } from 'http';
import socketio from 'socket.io';
import { getClicks, persistClicks } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const http = createServer(app);
const io = socketio(http);

let db_clicks = 0;
let socketCount = 0;

io.on('connection', (socket) => {
    socketCount++;
    io.emit('users connected', socketCount);

    socket.on('disconnect', () => {
        socketCount--;
        io.emit('users connected', socketCount);
    });

    socket.emit('initial clicks', db_clicks);

    socket.on('click', () => {
        db_clicks++;
        io.emit('update', db_clicks);
    });
});

async function start() {
    try {
        db_clicks = await getClicks();
    } catch (err) {
        console.error('Failed to load initial clicks, starting from 0:', err.message);
    }
    setInterval(() => persistClicks(db_clicks), 1000);
    http.listen(8080, () => console.log('listening on *:8080'));
}

start();
