import { io } from 'socket.io-client';

export const socket = io('/', {
  auth: { token: localStorage.getItem('token') },
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  randomizationFactor: 0.5,
  timeout: 20000,
});
