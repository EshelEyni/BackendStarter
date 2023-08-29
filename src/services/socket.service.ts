// import { Server } from "socket.io";
// import { info } from "./logger.service";

// interface ServerToClientEvents {
//   noArg: () => void;
//   basicEmit: (a: number, b: string, c: Buffer) => void;
//   withAck: (d: string, callback: (e: number) => void) => void;
// }

// interface ClientToServerEvents {
//   hello: () => void;
// }

// interface InterServerEvents {
//   ping: () => void;
// }

// interface SocketData {
//   name: string;
//   age: number;
// }

// const io = new Server<
//   ClientToServerEvents,
//   ServerToClientEvents,
//   InterServerEvents,
//   SocketData
// >();

// let gIo = null;

// function setupSocketAPI(http: any) {
//   gIo = require("socket.io")(http, {
//     cors: {
//       origin: "*",
//     },
//   });

//   if (!gIo) return;

//   gIo.on("connection", (socket) => {
//     info(`New connected socket [id: ${socket.id}]`);
//     socket.on("disconnect", (socket) => {
//       info(`Socket disconnected [id: ${socket.id}]`);
//     });
//     socket.on("set-user-socket", (userId) => {
//       info(`Setting socket.userId = ${userId} for socket [id: ${socket.id}]`);
//       socket.userId = userId;
//     });
//     socket.on("unset-user-socket", () => {
//       info(`Removing socket.userId for socket [id: ${socket.id}]`);
//       delete socket.userId;
//     });
//   });
// }

// function emitTo({ type, data, label }) {
//   if (label) gIo.to("watching:" + label.toString()).emit(type, data);
//   else gIo.emit(type, data);
// }

// async function emitToUser({ type, data, userId }) {
//   userId = userId.toString();
//   const socket = await _getUserSocket(userId);

//   if (socket) {
//     info(`Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`);
//     socket.emit(type, data);
//   } else {
//     info(`No active socket for user: ${userId}`);
//     // _printSockets()
//   }
// }

// // If possible, send to all sockets BUT not the current socket
// // Optionally, broadcast to a room / to all
// async function broadcast({ type, data, room = null, userId }) {
//   console.log("BROADCAST!");
//   userId = userId.toString();

//   info(`Broadcasting event: ${type}`);
//   const excludedSocket = await _getUserSocket(userId);
//   if (room && excludedSocket) {
//     info(`Broadcast to room ${room} excluding user: ${userId}`);
//     excludedSocket.broadcast.to(room).emit(type, data);
//   } else if (excludedSocket) {
//     console.log("data", data);
//     info(`Broadcast to all excluding user: ${userId}`);
//     excludedSocket.broadcast.emit(type, data);
//   } else if (room) {
//     info(`Emit to room: ${room}`);
//     gIo.to(room).emit(type, data);
//   } else {
//     info(`Emit to all`);
//     gIo.emit(type, data);
//   }
// }

// async function _getUserSocket(userId) {
//   const sockets = await _getAllSockets();
//   const socket = sockets.find((s) => s.userId === userId);
//   return socket;
// }
// async function _getAllSockets() {
//   // return all Socket instances
//   const sockets = await gIo.fetchSockets();
//   return sockets;
// }

// module.exports = {
//   // set up the sockets service and define the API
//   setupSocketAPI,
//   // emit to everyone / everyone in a specific room (label)
//   emitTo,
//   // emit to a specific user (if currently active in system)
//   emitToUser,
//   // Send to all sockets BUT not the current socket - if found
//   // (otherwise broadcast to a room / to all)
//   broadcast,
// };
