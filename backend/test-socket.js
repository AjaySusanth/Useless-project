import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Change to your backend URL

socket.on("connect", () => {
  console.log("Connected to socket server as", socket.id);

  // Example: Join groups
  socket.emit("join-groups", "testUserId", ["groupId1", "groupId2"]);

  // Example: Listen for alerts
  socket.on("alert-triggered", (data) => {
    console.log("Received alert-triggered:", data);
  });

  // Simulate disconnect after a while
  setTimeout(() => {
    socket.disconnect();
    console.log("Disconnected");
  }, 10000);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});