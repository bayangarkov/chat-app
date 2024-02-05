

const joinNs  = (element, nsData) => {
  const nsEndpoint = element.getAttribute('ns');
    console.log(nsEndpoint);

    const clickedNs = nsData.find(row => row.endpoint === nsEndpoint);

    // Global so we can submit the new message to the right place
    selectedNsId = clickedNs.id;
    const rooms = clickedNs.rooms;
    
    // get the roomlist div
    let roomList = document.querySelector('.room-list');
    // clear it out
    roomList.innerHTML = '';

    // Init first room variable
    let firstRoom;

    // loop through each room and add it to the DOM
    rooms.forEach((room, i) => {
      if(i === 0) {
        firstRoom = room.roomTitle;
      }
      // console.log(room);
      roomList.innerHTML += `<li class='room' namespaceId=${room.namespaceId}>
        <span class="fa-solid fa-${room.privateRoom ? 'lock' : 'globe'}">
      </span>${room.roomTitle}</li>`;
  })

  // Init join first room
  joinRoom(firstRoom, clickedNs.id);

  // Add click listener to each room so the client can tell the server it wants to join
  const roomNodes = document.querySelectorAll('.room');
  Array.from(roomNodes).forEach(element => {
    element.addEventListener('click', e => {
      const namespaceId = element.getAttribute('namespaceId')
      console.log(`Someone clicked on ${e.target.innerText}`);
      joinRoom(e.target.innerText,namespaceId);
    })
  })

}