import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios"; // Added axios import
import { getGroupDetails } from "../services/groups";

// Adjust to your backend’s Socket.IO endpoint
const SOCKET_URL = "http://localhost:5000";

// Replace this with your actual user context/hook (from auth)
const getCurrentUser = () => {
  // Example: get from localStorage, context, or props
  // return JSON.parse(localStorage.getItem("user"));
  return { username: "Ajay" }; // Hardcoded for demo, replace with real user!
};

export const alertGroup = (groupId, triggeredBy) =>
  axios.post("http://localhost:5000/api/alerts/trigger", { groupId, triggeredBy });

export const releaseGroupAlert = (groupId, triggeredBy) =>
  axios.post("http://localhost:5000/api/alerts/release", { groupId, triggeredBy });

export default function GroupDetails() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");
  const [alerting, setAlerting] = useState(false);
  const [success, setSuccess] = useState("");
  const [activeAlerts, setActiveAlerts] = useState([]); // Array of alerts
  const [alerts, setAlerts] = useState([]);
  const socketRef = useRef(null);

  const currentUser = getCurrentUser();

  // Fetch group details
  useEffect(() => {
    async function fetchGroup() {
      setError("");
      setSuccess("");
      try {
        const res = await getGroupDetails(groupId);
        setGroup(res.data.group);
        if (res.data.group.activeAlerts && Array.isArray(res.data.group.activeAlerts)) {
          setActiveAlerts(res.data.group.activeAlerts);
        } else {
          setActiveAlerts([]);
        }
      } catch (err) {
        setError(
          err.response?.data?.error || "Could not fetch group details."
        );
      }
    }
    fetchGroup();
  }, [groupId]);

  // Setup Socket.IO for real-time alert updates
  useEffect(() => {
    const sock = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = sock;
    if (groupId && currentUser?.username) {
      sock.emit("join-groups", currentUser.username, [groupId]);
    }
    sock.on("alert-triggered", (data) => {
      if (data.groupId === groupId) {
        setActiveAlerts(data.activeAlerts || []);
        setAlerts((prev) => [
          {
            ...data,
            receivedAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    });
    sock.on("alert-released", (data) => {
      if (data.groupId === groupId) {
        setActiveAlerts(data.activeAlerts || []);
        setAlerts((prev) => [
          {
            ...data,
            receivedAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    });
    return () => {
      sock.disconnect();
    };
  }, [groupId, currentUser?.username]);

  // Handle trigger alert
  async function handleAlert() {
    setAlerting(true);
    setError("");
    setSuccess("");
    try {
      await alertGroup(groupId, currentUser.username);
      setSuccess("Alert triggered!");
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to trigger alert"
      );
    } finally {
      setAlerting(false);
    }
  }

  // Handle release alert
  async function handleRelease() {
    setAlerting(true);
    setError("");
    setSuccess("");
    try {
      await releaseGroupAlert(groupId, currentUser.username);
      setSuccess("Alert released!");
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to release alert"
      );
    } finally {
      setAlerting(false);
    }
  }

  // Determine if current user has an active alert
  const userAlert = activeAlerts.find(
    (a) => a.triggeredBy === currentUser.username
  );
  const isAlertActive = activeAlerts.length > 0;

  if (error)
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center text-red-400">
        <p>{error}</p>
      </div>
    );

  if (!group)
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center text-white">
        <p>Loading group...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center py-10">
      <div className="bg-[#1c1c1c] rounded-lg w-[420px] p-6 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
        <p className="text-gray-400 mb-2">{group.description}</p>
        <p className="text-xs text-purple-400 mb-2">
          Join Code: {group.joinCode}
        </p>
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              isAlertActive ? "bg-red-500" : "bg-green-500"
            }`}
            title={isAlertActive ? "Alert is Active" : "No Alert Active"}
          />
          <span className="text-sm font-semibold">
            {isAlertActive
              ? `ALERT ACTIVE! by ${activeAlerts.map(a => a.triggeredBy).join(", ")}`
              : "No Alert"}
          </span>
        </div>
        {userAlert ? (
          <button
            disabled={alerting}
            onClick={handleRelease}
            className="w-full bg-green-700 hover:bg-green-800 p-2 rounded font-semibold"
          >
            {alerting ? "Releasing..." : "✅ Release Your Alert"}
          </button>
        ) : (
          <button
            disabled={alerting || isAlertActive}
            onClick={handleAlert}
            className="w-full bg-red-600 hover:bg-red-700 p-2 rounded font-semibold"
          >
            {alerting ? "Alerting..." : "🚨 Trigger Alert"}
          </button>
        )}
        {success && (
          <p className="text-green-400 mt-2 text-sm">{success}</p>
        )}
      </div>

      {/* Alert Log */}
      <div className="bg-[#1c1c1c] rounded-lg w-[420px] p-4 mb-8 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Alert Log</h3>
        {alerts.length === 0 ? (
          <p className="text-gray-400">No alerts yet for this group.</p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li
                key={alert.alertId} // Changed key to use alertId, which is unique
                className="bg-[#ffe5e5] border border-[#ff4b4b] text-[#b80000] p-3 rounded"
              >
                <b>{alert.message}</b>
                <br />
                <span className="text-xs">
                  By: {alert.triggeredBy}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Members & Admins */}
      <div className="bg-[#1c1c1c] rounded-lg w-[420px] p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        <ul className="space-y-2">
          {group.members.map((user) => (
            <li key={user._id} className="flex items-center gap-3">
              <img
                src={user.avatarUrl}
                alt={user.displayName || user.username}
                className="w-8 h-8 rounded-full object-cover border border-gray-600"
                onError={(e) => (e.target.style.display = "none")}
              />
              <span className="font-semibold">{user.displayName || user.username}</span>
              {group.admins.some((a) => a._id === user._id) && (
                <span className="text-xs bg-purple-700 text-white rounded px-2 py-0.5 ml-auto">
                  Admin
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
