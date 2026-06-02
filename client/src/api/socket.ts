import { io } from 'socket.io-client';

export const socket = io('/', {
  auth: { token: localStorage.getItem('token') },
  autoConnect: false,
});
