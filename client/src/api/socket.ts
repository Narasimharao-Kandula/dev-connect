import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || '';

export const socket = io(API_URL || '/', {
  auth: { token: localStorage.getItem('token') },
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  randomizationFactor: 0.5,
  timeout: 20000,
});
