import { Server } from "socket.io";

const io = new Server(8000,{
    cors:true,
});

//holds a key value pair
const nameToSocketMap = new Map();
const socketToName = new Map();


io.on('connection', (socket) => {
    console.log("Socket Connected", socket.id);
    socket.on('room:join', (data) => {
        const {userName, room} = data;
        nameToSocketMap.set(userName, socket.id);
        socketToName.set(socket.id, userName);
        // socket.to('room:join', data);
        // // io.to(room).emit("user:joined", { userName, id: socket.id });
        io.to(socket.id).emit("room:join", data) ;
    })
})