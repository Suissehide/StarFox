// `io` is a global set by /socket.io/socket.io.js, which loads as a plain
// synchronous <script> before this ES module executes (modules are deferred).
let _socket = null;

export function initSocket({ onInitialClicks, onUpdate, onUsersConnected }) {
    _socket = io.connect(); // eslint-disable-line no-undef
    _socket.on('initial clicks', onInitialClicks);  // number → set initial counter
    _socket.on('update', onUpdate);                 // number → update counter
    _socket.on('users connected', onUsersConnected); // number → update user display
}

export function emitClick() {
    _socket.emit('click'); // no payload
}
