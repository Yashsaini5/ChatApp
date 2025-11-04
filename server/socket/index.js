const socketIo = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const chatSocket = require("./chatSocket");
const callSocket = require("./callSocket");

const socketSetup = (server) => {
  const allowedOrigins = process.env.CORS_ORIGINS.split(",");
  const io = socketIo(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    // console.log("Handshake cookies:", socket.handshake.headers.cookie);
    const token = cookies.token;

    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("invalid token"));
    }
  });

    io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, socket.user?.email);
    chatSocket(io, socket);
    callSocket(io, socket);
})  
};

module.exports = socketSetup;
