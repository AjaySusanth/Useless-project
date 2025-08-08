import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from "cookie-parser";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'
import groupRoutes from './routes/group.route.js'

dotenv.config();
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

/** --- 1. Create HTTP server and Socket.IO server --- */
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // In prod, set this to your frontend URL!
    methods: ["GET", "POST"]
  }
});

/** --- 2. Socket.IO logic --- */
const userSocketMap = new Map();

io.on("connection", (socket) => {
  // Listen for a user joining their group rooms
  socket.on("join-groups", (userId, groupIds) => {
    groupIds.forEach((groupId) => {
      socket.join(groupId); // User joins a room for each group they're in
    });
    userSocketMap.set(userId, socket.id);
  });

  socket.on("disconnect", () => {
    // Optional: Cleanup userSocketMap if needed
    // userSocketMap.delete(...);
  });
});

/** --- 3. Make io available in routes/controllers --- */
app.set("io", io);

/** --- 4. API routes --- */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);

/** --- 5. Connect to MongoDB --- */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Atlas connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}
connectDB();

/** --- 6. Health check route --- */
app.get("/", (req, res) => {
  res.send("Mama's Calling backend is running!");
});

/** --- 7. Start the server with server.listen, NOT app.listen --- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server + Socket.IO listening on port ${PORT}`);
});