const users = {}; // email: socketId mapping

module.exports = (io, socket) => {

    const userId = socket.user._id || socket.user.id;
    if(userId) users[userId] = socket.id;

    socket.on("call-user", ({ to, offer, from , name, mode}) => {
        const targetSocketId = users[to];
        if (targetSocketId) {
            io.to(targetSocketId).emit("incoming-call", { from, offer, name, mode });
        } else {
            io.to(socket.id).emit("call-error", { message: "User is not available for call." });
        }
    });

    socket.on("accept-call", ({ to, answer }) => {
        const targetSocketId = users[to];
        if (targetSocketId) {
            io.to(targetSocketId).emit("call-accepted", { answer });
        }
    });

    socket.on("reject-call", ({ to }) => {
  io.to(users[to]).emit("call-rejected");
});

    socket.on("ice-candidate", ({ to, candidate }) => {
        const peerSocketId = users[to];
        if (peerSocketId) {
            io.to(peerSocketId).emit("ice-candidate", { candidate });
        }
    });

    socket.on("hang-up", ({ to, from }) => {
  const peerSocketId = users[to];
  const callerSocketId = users[from];

  // Notify the callee
  if (peerSocketId) {
    io.to(peerSocketId).emit("hang-up");
  }

//   Notify the caller
//   if (callerSocketId) {
//     io.to(callerSocketId).emit("hang-up");
//   }
});

    socket.on("disconnect", () => {
        if(userId && users[userId] === socket.id){
            delete users[userId];
        }
    });
};
