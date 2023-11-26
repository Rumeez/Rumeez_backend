import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer;

export const initSocket = (server: HTTPServer) => {
    io = new SocketIOServer(server);
    return io;
};

export const getSocket = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized!");
    }
    return io;
};