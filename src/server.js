const path = require('path');
const express = require('express');
const app = express();
app.use(express.static((path.join(__dirname, '/public'))));

const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

const rq = require('./request');

/* Socket */
let init = false;
let db_clicks = -1;
let socketCount = 0;

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

    setInterval(function () {
      rq.setClicks(db_clicks);
    }, 1000);

    init = true;
  } else {
    socket.emit('initial clicks', db_clicks);
  }

  socket.on('click', () => {
    db_clicks += 1;
    io.emit('update', db_clicks);
  });

});

http.listen(8080, () => {
  console.log('listening on *:8080');
});