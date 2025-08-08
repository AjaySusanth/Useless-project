import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Change this URL to your backend Socket.IO server
const SOCKET_URL = "http://localhost:5000";

export default function MamaAlertDemo() {
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState("testUser");
  const [groupIds, setGroupIds] = useState("groupId1");
  const [joined, setJoined] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Connect on mount
    const sock = io(SOCKET_URL, { withCredentials: true });
    setSocket(sock);

    // Listen for alert-triggered
    sock.on("alert-triggered", (data) => {
      setAlerts((prev) => [
        {
          ...data,
          receivedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    // Clean up on unmount
    return () => {
      sock.disconnect();
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!socket) return;
    const groups = groupIds.split(",").map((g) => g.trim());
    socket.emit("join-groups", userId, groups);
    setJoined(true);
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "2rem auto" }}>
      <h1>React Mama's Calling Alert Demo</h1>
      <form onSubmit={handleJoin} style={{ marginBottom: 24 }}>
        <label>
          User ID:{" "}
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            style={{ marginRight: 8 }}
          />
        </label>
        <label>
          Group IDs (comma):{" "}
          <input
            value={groupIds}
            onChange={(e) => setGroupIds(e.target.value)}
            required
            style={{ marginRight: 8 }}
          />
        </label>
        <button type="submit" disabled={joined}>
          {joined ? "Joined!" : "Join Groups"}
        </button>
      </form>

      {alerts.length > 0 && (
        <div>
          <h3>Received Alerts</h3>
          <div>
            {alerts.map((alert, i) => (
              <div
                key={alert.alertId + i}
                style={{
                  background: "#ffe5e5",
                  border: "2px solid #ff4b4b",
                  color: "#b80000",
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 12,
                  fontSize: 18,
                  animation: "pop 0.2s",
                }}
              >
                <b>{alert.message}</b>
                <br />
                <small>
                  Group: {alert.groupId} | By: {alert.triggeredBy} <br />
                  At: {new Date(alert.startedAt).toLocaleString()} | Received: {new Date(alert.receivedAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Animation CSS */}
      <style>{`
        @keyframes pop { from { transform: scale(0.7); } to { transform: scale(1); } }
      `}</style>
    </div>
  );
}