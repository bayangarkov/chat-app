const express = require('express');
const app = express();
const socketio = require('socket.io');

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(8000);
// io = server object in the docs
const io = socketio(expressServer);

// The (socket) is the thing that connected on the socket server
io.on('connection', (socket) => {
  console.log(socket.id, 'has connected!');
  // socket.emit('messageFromServer', {data: 'Welcome to the socket server!'});
  socket.on('newMessageToServer', (dataFromClient) => {
    console.log(dataFromClient);
    // Everybody will get the emit event
    io.emit('newMessageToClients', {text: dataFromClient.text});
  })
});
