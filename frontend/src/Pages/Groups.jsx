import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup, joinGroup, getMyGroups } from "../services/groups";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const res = await getMyGroups();
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const group = await createGroup(createForm);
      setCreateForm({ name: "", description: "" });
      fetchGroups();
      // Redirect to the new group's details page
      // If your backend returns the created group, use group.data._id
      // Otherwise, fetchGroups() and redirect to the latest group
      if (group && group.data && group.data._id) {
        navigate(`/groups/${group.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Could not create group");
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await joinGroup({ joinCode });
      setJoinCode("");
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.error || "Could not join group");
    }
  };

  const handleGroupClick = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6">👥 Your Groups</h1>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* Create Group */}
      <form
        onSubmit={handleCreate}
        className="bg-[#1c1c1c] p-4 rounded-lg w-96 mb-6 space-y-3"
      >
        <h2 className="text-xl font-semibold">Create Group</h2>
        <input
          className="w-full p-2 bg-[#2a2a2a] rounded"
          placeholder="Group Name"
          value={createForm.name}
          onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
          required
        />
        <input
          className="w-full p-2 bg-[#2a2a2a] rounded"
          placeholder="Description"
          value={createForm.description}
          onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
        />
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded font-semibold"
        >
          Create
        </button>
      </form>

      {/* Join Group */}
      <form
        onSubmit={handleJoin}
        className="bg-[#1c1c1c] p-4 rounded-lg w-96 mb-6 space-y-3"
      >
        <h2 className="text-xl font-semibold">Join Group</h2>
        <input
          className="w-full p-2 bg-[#2a2a2a] rounded"
          placeholder="Enter Join Code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 p-2 rounded font-semibold"
        >
          Join
        </button>
      </form>

      {/* Groups List */}
      <div className="bg-[#1c1c1c] p-4 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">My Groups</h2>
        {groups.length === 0 ? (
          <p className="text-gray-400">You are not in any groups yet.</p>
        ) : (
          <ul className="space-y-2">
            {groups.map((group) => (
              <li
                key={group._id}
                className="bg-[#2a2a2a] p-3 rounded hover:bg-[#3a3a3a] transition cursor-pointer"
                onClick={() => handleGroupClick(group._id)}
              >
                <h3 className="font-bold">{group.name}</h3>
                <p className="text-gray-400 text-sm">{group.description}</p>
                <p className="text-xs text-purple-400 mt-1">
                  Join Code: {group.joinCode}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}