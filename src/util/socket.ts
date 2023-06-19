import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from './socket.types'

const socket : Socket<ServerToClientEvents,ClientToServerEvents> = io(import.meta.env.VITE_SERVER_URL, {
  autoConnect: false
});

socket.on('connect_error', (err) => {
  console.error('Unable to connect to backend - ', err)
})
socket.onAny((event, ...args) => {
  console.log(event, JSON.stringify(args));
});

export default socket;
