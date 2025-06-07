import { io } from "socket.io-client";

const socket = io(`${process.evn.NEXT_PUBLIC_SOCKET_URL}`, {
    autoConnect: false,
    transports: ["websocket"],
});

export default socket;