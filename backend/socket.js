import { io } from "socket.io-client";
const socket = io("http://localhost:5000"); // Change to your backend URL

// After login or fetching user's groups:
socket.emit("join-groups", userId, [groupId1, groupId2]);

// Listen for alerts:
socket.on("alert-triggered", (data) => {
  alert(data.message); // Show in UI (make it fun!)
  // Optionally show who triggered, how long, etc.
});