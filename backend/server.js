
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
import alertRoutes from './routes/alert.route.js';

// In-memory alert status (per group, can have multiple active alerts)
export const groupAlertStatus = {};

export const triggerAlert = (req, res) => {
  const { groupId, triggeredBy } = req.body;
  if (!groupId || !triggeredBy) return res.status(400).json({ error: "groupId and triggeredBy required" });

  const startedAt = new Date().toISOString();
  // Corrected template literal syntax
  const alertId = `${groupId}_${triggeredBy}_${Date.now()}`;

  if (!groupAlertStatus[groupId]) groupAlertStatus[groupId] = [];

  // Check if this user already has an active alert
  if (groupAlertStatus[groupId].some(a => a.triggeredBy === triggeredBy)) {
    return res.status(400).json({ error: "You already activated an alert" });
  }

  groupAlertStatus[groupId].push({ triggeredBy, startedAt, alertId });

  const io = req.app.get("io");
  io.to(groupId).emit("alert-triggered", {
    groupId,
    triggeredBy,
    message: "SHUT UP! MAMA'S CALLING!",
    alertId,
    startedAt,
    activeAlerts: groupAlertStatus[groupId],
  });
  res.json({ status: "alert sent" });
};

export const releaseAlert = (req, res) => {
  const { groupId, triggeredBy } = req.body;
  if (!groupId || !triggeredBy) return res.status(400).json({ error: "groupId and triggeredBy required" });

  if (!groupAlertStatus[groupId]) {
    return res.status(400).json({ error: "No active alert to release" });
  }

  // Remove alert for this user
  groupAlertStatus[groupId] = groupAlertStatus[groupId].filter(a => a.triggeredBy !== triggeredBy);

  const io = req.app.get("io");
  io.to(groupId).emit("alert-released", {
    groupId,
    triggeredBy,
    message: "Alert released.",
    // Corrected template literal syntax
    alertId: `${groupId}_released_${Date.now()}`,
    activeAlerts: groupAlertStatus[groupId],
  });
  res.json({ status: "alert released" });
};

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const userSocketMap = new Map();

io.on("connection", (socket) => {
  socket.on("join-groups", (userId, groupIds) => {
    groupIds.forEach((groupId) => {
      socket.join(groupId);
      // Removed the redundant alert-triggered loop for a single connection,
      // as the frontend will fetch the latest state on mount.
      if (groupAlertStatus[groupId] && groupAlertStatus[groupId].length > 0) {
        socket.emit("alert-triggered", {
          groupId,
          message: "SHUT UP! MAMA'S CALLING!",
          activeAlerts: groupAlertStatus[groupId],
        });
      }
    });
    userSocketMap.set(userId, socket.id);
  });

  socket.on("disconnect", () => {
    // Optional: Cleanup userSocketMap if needed
    // for (let [key, value] of userSocketMap.entries()) {
    //   if (value === socket.id) {
    //     userSocketMap.delete(key);
    //     break;
    //   }
    // }
  });
});

app.set("io", io);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/alerts", alertRoutes);

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

app.get("/", (req, res) => {
  res.send("Mama's Calling backend is running!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  // Corrected template literal syntax
  console.log(`Server + Socket.IO listening on port ${PORT}`);
});


