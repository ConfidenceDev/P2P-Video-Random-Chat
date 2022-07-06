const { fetchPeer, removePeer } = require("../models/main");

function main(io, socket) {
  const naira = "450";
  const msg = "";

  //============= ONLINE ====================
  let count = io.sockets.server.engine.clientsCount;
  io.emit("online", count);
  socket.emit("values", {
    naira: naira,
  });
  socket.emit("info", msg);

  //============= Peer =================
  socket.on("peer", (data) => {
    fetchPeer(data)
      .then((result) => {
        const doc = {
          userId: result.userId,
          socketId: result.socketId,
        };
        socket.emit("found", doc);
        socket.broadcast.to(result.socketId).emit("found", data);
      })
      .catch((err) => {
        //console.log(err);
      });
  });

  //============= Remove =================
  socket.on("remove", async (data) => {
    await removePeer(data);
  });

  //============= Comment =================
  socket.on("comment", (data) => {
    if (data.remoteId) {
      socket.broadcast.to(data.remoteId).emit("comment", data);
      socket.emit("comment", data);
    }
  });

  //============= Typing =================
  socket.on("typing", (data) => {
    if (data.remoteId) socket.broadcast.to(data.remoteId).emit("typing", data);
  });

  //============= Filter =================
  socket.on("filter", (data) => {
    if (data.remoteId) socket.broadcast.to(data.remoteId).emit("filter", data);
  });

  //============= Leave =================
  socket.on("leave", (data) => {
    if (data.remoteId) socket.broadcast.to(data.remoteId).emit("leave", data);
  });

  //============= DISCONNECT =================
  socket.on("disconnect", () => {
    let count = io.sockets.server.engine.clientsCount;
    io.emit("online", count);
  });
}

module.exports = main;
