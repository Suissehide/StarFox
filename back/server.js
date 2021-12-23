var path = require('path');
var express = require('express');
var app = express();
app.use(express.static((path.join(__dirname, '../front'))));

var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

var rq = require('./request');

/* Socket */
var init = false;
var db_clicks = -1;
var socketCount = 0;

io.on('connection', (socket) => {
    socketCount++;
    io.sockets.emit('users connected', socketCount)

    socket.on('disconnect', () => {
        socketCount--;
        io.sockets.emit('users connected', socketCount);
    })

    if (!init) {
        rq.con.query('SELECT click FROM abacus LIMIT 1')
            .on('result', function (data) {
                db_clicks = data['click'];
            })
            .on('end', function () {
                socket.emit('initial clicks', db_clicks);
            })
        init = true;
    } else {
        socket.emit('initial clicks', db_clicks);
    }

    socket.on('click', () => {
        rq.addClicks(1);
        db_clicks += 1;
        io.emit('update', db_clicks);
    });
});

http.listen(8080, () => {
    console.log('listening on *:8080');
});