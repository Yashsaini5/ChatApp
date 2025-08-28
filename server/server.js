const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const socket = require("socket.io");
const cookieParser = require("cookie-parser");
require('dotenv').config({ path: __dirname + '/.env' })
const connectDB = require('./config/db')
const socketSetup = require("./socket")

const server = http.createServer(app);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
connectDB()

const userRoutes = require("./routes/userRoutes");
app.use("/api/user", userRoutes);

const messageRoutes = require('./routes/messageRoutes')
app.use('/api/message', messageRoutes)

socketSetup(server)

server.listen("5000", () => console.log("server started"));
