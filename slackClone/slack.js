const express = require('express');
const app = express();
const socketio = require('socket.io');

const namespaces = require('./data/namespaces');
const Room = require('./classes/Room');


app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(9000);
// io = server object in the docs
const io = socketio(expressServer);

// Manufactured way to change a NS
app.get('/change-ns', (req, res) => {
  // Update namespace array
  namespaces[0].addRoom(new Room(0, 'Deleted articles', 0));
  // Let everyone know that this namespace changed
  io.of(namespaces[0].endpoint).emit('nsChange', namespaces[0])
  res.json(namespaces[0]);
})

// The (socket) is the thing that connected on the socket server
io.on('connection', (socket) => {
  socket.emit('welcome', 'Welcome to the server!')
  socket.on('clientConnect', (data) => {
    console.log(socket.id, 'has connected!')
    socket.emit('nsList', namespaces);
  })

});

namespaces.forEach(namespace => {
  
  io.of(namespace.endpoint).on('connection', (socket) => {
    
    socket.on('joinRoom', async (roomObj, ackCallBack) => {
      // Need to fetch history
      const thisNs = namespaces[roomObj.namespaceId];
      const thisRoomObj = thisNs.rooms.find(room => room.roomTitle === roomObj.roomTitle);
      const thisRoomsHistory = thisRoomObj.history;

      
      // Leave all rooms (except own room), because the client can only be in one room
      const rooms = socket.rooms;
      let i = 0;
      rooms.forEach(room => {
        // We dont want to leave the socket's personal room which is guaranteed to be first
        if(i !== 0) {
          socket.leave(room);
        }
        i++;
      })
      

      // Join the room
      // roomTitle is coming from the client. 
      // Auth must be implemented if the socket has right to enter
      socket.join(roomObj.roomTitle);

      // Fetch the number of sockets in this room
      const sockets = await io.of(namespace.endpoint).in(roomObj.roomTitle).fetchSockets();
    
      const socketCount = sockets.length;
      

      ackCallBack({
        numUsers: socketCount,
        thisRoomsHistory
      });
    })

    socket.on('newMessageToRoom', (messageObj) => {
      console.log(messageObj);
      // Broadcast this to all connected client but to this room only!!!
      const rooms = socket.rooms;
      const currentRoom = [...rooms][1]; // This is set is not array

      // Send out this messageObj to everyone including the sender
      io.of(namespace.endpoint).in(currentRoom).emit('messageToRoom', messageObj);
      // Add this message to this room's history
      const thisNs = namespaces[messageObj.selectedNsId];
      const thisRoom = thisNs.rooms.find(room => room.roomTitle === currentRoom);
      console.log(thisRoom);
      thisRoom.addMessage(messageObj);
    })

  })
  
})

