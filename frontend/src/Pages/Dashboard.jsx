import { logout } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-[#0f0f0f] text-white">
      <h1 className="text-3xl font-bold mb-4">🚨 Shut Up Alert Dashboard</h1>
      <p className="mb-6 text-gray-400">Main features will go here</p>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
      >
        Logout
      </button>
    </div>
  );
}
