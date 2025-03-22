require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/dbConn");
const socketIo = require("socket.io");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);
const io = socketIo(server);

const startServer = async () => {
  try {
    // connect to mongoDB
    connectDB();
    mongoose.connection.once("open", () => {
      console.log("Connected to MongoDB");
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

startServer();
