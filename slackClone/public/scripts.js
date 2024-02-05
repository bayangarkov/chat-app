// Default values for testing purposes
const userName = 'Bob';
const userPass = 'x';

// Always join the main namespace, because that's where the client gets the other namespaces from.
const socket = io('http://localhost:9000');

// Sockets will be put into this array, in the index of their ns.id's.
const nameSpaceSockets = [];
const listeners = {
  nsChange: [],
  messageToRoom: []
};

// A global variable we can update when the user clicks on a message
// we will use it to broadcast across the app
let selectedNsId = 0;

document.querySelector('#message-form').addEventListener('submit', e => {
  e.preventDefault();
  const newMessage = document.querySelector('#user-message').value;
  console.log(newMessage, selectedNsId);
  nameSpaceSockets[selectedNsId].emit('newMessageToRoom', {
    newMessage,
    date: Date.now(),
    avatar: 'https://via.placeholder.com/30',
    userName,
    selectedNsId
  })
  document.querySelector('#user-message').value = '';
})

// addListeners job is to manage all listeners added to all namespaces
// this prevents listeners added multiple times
const addListeners = (nsId) => {
  if(!listeners.nsChange[nsId]) {
    nameSpaceSockets[nsId].on('nsChange', (data) => {
      console.log('Namespace changed');
      console.log(data);
    });
    listeners.nsChange[nsId] = true;
  };
  if(!listeners.messageToRoom[nsId]) {
    // Add the nsId listener to this namespace
    nameSpaceSockets[nsId].on('messageToRoom', (messageObj) => {
      console.log(messageObj);
      document.querySelector('#messages').innerHTML += buildMessageHtml(messageObj);
    })
    listeners.messageToRoom[nsId] = true;
  }
};


socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('clientConnect');
});


// Listens for the nsList event which give us the namespaces
socket.on('nsList', (nsData) => {
  console.log(nsData);

  const nameSpacesDiv = document.querySelector('.namespaces');
  nameSpacesDiv.innerHTML = '';

  nsData.forEach(ns => {
    // Update the HTML with each ns
    nameSpacesDiv.innerHTML += `<div class="namespace" ns="${ns.endpoint}"><img src="${ns.image}"></div>`;

    // Initialize thisNs as it's index in nameSpaceSockets
    // If the connection is new, this will be null
    // If the connection has already been established, it will reconnect and remain in it's spot.

    if(!nameSpaceSockets[ns.id]) {
      // There is no socket in this ns Id. So make a new connection
      // Join this namespace with io();
      nameSpaceSockets[ns.id] = io(`http://localhost:9000${ns.endpoint}`);
    }

    addListeners(ns.id);

  });

  Array.from(document.getElementsByClassName('namespace')).forEach(element => {
    // console.log(element);
    element.addEventListener('click', e => {
      joinNs(element, nsData);
    })
  });

  // Simulates user clicked on the first namespace so to populate rooms when loading
  joinNs(document.getElementsByClassName('namespace')[0], nsData);
})

