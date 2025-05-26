    // utils/socket.js
import { io } from 'socket.io-client'

let socket

export const connectSocket = (userId) => {
  if (!socket || !socket.connected) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      query: { userId },
      withCredentials: true,
    })
  }

  return socket
}
