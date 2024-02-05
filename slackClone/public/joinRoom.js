const joinRoom = async (roomTitle, namespaceId) => {
  console.log(roomTitle, namespaceId);
  const ackResp = await nameSpaceSockets[namespaceId].emitWithAck('joinRoom', {roomTitle, namespaceId});

  console.log(ackResp);
  document.querySelector('.curr-room-num-users').innerHTML = `<span class="fa-solid fa-user"></span> ${ackResp.numUsers}`;
  document.querySelector('.curr-room-text').innerHTML = roomTitle;

  // We get back history in acknowledge as well.
  document.querySelector('#messages').innerHTML = '';

  ackResp.thisRoomsHistory.forEach(message => {
    document.querySelector('#messages').innerHTML += buildMessageHtml(message);
  });
}