import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" },
    allowEIO3: false,
    transports: ["websocket"]
});

const rooms = {};

io.on("connection", socket => {
    socket.on("join-room", roomId => {
        console.log(`Socket ${socket.id} joined room ${roomId}`);

        socket.join(roomId);

        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push(socket.id);

        console.log(rooms);

        socket.emit(
            "existing-users",
            rooms[roomId].filter(id => id !== socket.id)
        );

        socket.to(roomId).emit("user-joined", socket.id);

        socket.on("signal", ({ target, data }) => {
            io.to(target).emit("signal", {
                from: socket.id,
                data
            });
        });

        socket.on("disconnect", () => {
            rooms[roomId] = rooms[roomId]?.filter(id => id !== socket.id);
            socket.to(roomId).emit("user-left", socket.id);
        });
    });
});

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on ${PORT}`)
})
