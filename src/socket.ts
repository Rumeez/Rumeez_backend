import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer;

export const initSocket = (server: HTTPServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        }
    });
    return io;
};

export const getSocket = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized!");
    }
    console.log("Returning Socket.IO instance");
    return io;
};