import { useState } from "react";
import { login } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1c1c1c] p-6 rounded-lg shadow-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>
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
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded font-semibold"
        >
          Login
        </button>
        <p className="text-sm text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
