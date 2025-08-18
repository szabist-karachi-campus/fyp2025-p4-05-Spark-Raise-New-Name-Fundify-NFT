import { io } from "socket.io-client";
const SOCKET_URL = "http://localhost:5001";
let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, { transports: ["websocket"] });
  }
  return socket;
}; 