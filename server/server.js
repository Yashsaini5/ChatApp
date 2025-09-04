const express = require("express");
const app = express();
const http = require('http')
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('dotenv').config({ path: __dirname + '/.env' })
const connectDB = require('./config/db')
const socketSetup = require("./socket")

const server = http.createServer(app);

const allowedOrigins = process.env.CORS_ORIGINS || ["http://localhost:5173"];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", allowedOrigins);
  next();
});
app.use(cookieParser());
app.use(express.json());
connectDB()

const userRoutes = require("./routes/userRoutes");
app.use("/api/user", userRoutes);

const messageRoutes = require('./routes/messageRoutes')
app.use('/api/message', messageRoutes)

socketSetup(server)

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("server started"));
