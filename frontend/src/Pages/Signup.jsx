import { useState } from "react";
import { signup } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    displayName: "",
    avatarUrl: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1c1c1c] p-6 rounded-lg shadow-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          className="w-full p-2 bg-[#2a2a2a] rounded"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 bg-[#2a2a2a] rounded"
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 bg-[#2a2a2a] rounded"
          name="displayName"
          placeholder="Display Name"
          onChange={handleChange}
        />
        <input
          className="w-full p-2 bg-[#2a2a2a] rounded"
          name="avatarUrl"
          placeholder="Avatar URL (optional)"
          onChange={handleChange}
        />
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded font-semibold"
        >
          Sign Up
        </button>
        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
