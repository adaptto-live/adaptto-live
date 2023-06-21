import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from './socket.types'
import debugConsoleLog from './debugConsoleLog';

const socket : Socket<ServerToClientEvents,ClientToServerEvents> = io(import.meta.env.VITE_SERVER_URL, {
  autoConnect: false
});

socket.on('connect_error', (err) => {
  console.error('Unable to connect to backend - ', err)
})
socket.on('connect', () => {
  debugConsoleLog(`socket connect`);
})
socket.on('disconnect', () => {
  debugConsoleLog(`socket disconnect`);
})
socket.io.on('reconnect', () => {
  debugConsoleLog(`socket reconnect`);
})
socket.io.on('reconnect_attempt', () => {
  debugConsoleLog(`socket reconnect_attempt`);
})
socket.io.on('reconnect_failed', () => {
  debugConsoleLog(`socket reconnect_failed`);
})
socket.io.on('reconnect_error', (err) => {
  console.error('Unable to reconnect to backend - ', err)
})
socket.onAny((event, ...args) => {
  debugConsoleLog(`<- ${event} ${JSON.stringify(args)}`);
});
socket.onAnyOutgoing((event, ...args) => {
  debugConsoleLog(`-> ${event} ${JSON.stringify(args)}`);
});

export default socket;
