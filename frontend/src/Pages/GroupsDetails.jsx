import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// You need to implement these in your services!
import { getGroupDetails, alertGroup } from "../services/groups";

export default function GroupDetails() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");
  const [alerting, setAlerting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchGroup();
    // eslint-disable-next-line
  }, [groupId]);

  async function fetchGroup() {
    setError("");
    setSuccess("");
    try {
      const res = await getGroupDetails(groupId);
      setGroup(res.data.group);
    } catch (err) {
      setError(
        err.response?.data?.error || "Could not fetch group details."
      );
    }
  }

  async function handleAlert() {
    setAlerting(true);
    setError("");
    setSuccess("");
    try {
      await alertGroup(groupId);
      setSuccess("Alert triggered!");
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to trigger alert"
      );
    } finally {
      setAlerting(false);
    }
  }

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
              group.alertActive ? "bg-red-500" : "bg-green-500"
            }`}
            title={group.alertActive ? "Alert is Active" : "No Alert Active"}
          />
          <span className="text-sm">
            {group.alertActive ? "Alert Active" : "No Alert"}
          </span>
        </div>
        <button
          disabled={alerting || group.alertActive}
          onClick={handleAlert}
          className={`w-full p-2 rounded font-semibold transition ${
            alerting || group.alertActive
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {group.alertActive ? "Alert Ongoing" : alerting ? "Alerting..." : "🚨 Alert!"}
        </button>
        {success && (
          <p className="text-green-400 mt-2 text-sm">{success}</p>
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