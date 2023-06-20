import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from './socket.types'
import debugConsoleLog from './debugConsoleLog';

const socket : Socket<ServerToClientEvents,ClientToServerEvents> = io(import.meta.env.VITE_SERVER_URL, {
  autoConnect: false
});

socket.on('connect_error', (err) => {
  console.error('Unable to connect to backend - ', err)
})
socket.onAny((event, ...args) => {
  debugConsoleLog(`<- ${event} ${JSON.stringify(args)}`);
});
socket.onAnyOutgoing((event, ...args) => {
  debugConsoleLog(`-> ${event} ${JSON.stringify(args)}`);
});

export default socket;
