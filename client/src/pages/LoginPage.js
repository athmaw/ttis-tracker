import React, { useState } from "react";
import { useAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API || "http://localhost:4000/api";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@technotool.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const { save } = useAuth();
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      save(data.token, data.user);
      nav("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md card">
        <h2 className="text-2xl font-semibold mb-2">Sign in</h2>
        <p className="text-sm text-slate-500 mb-4">Default admin: admin@technotool.local / admin123</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input className="mt-1 block w-full border rounded px-3 py-2"
              value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" className="mt-1 block w-full border rounded px-3 py-2"
              value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>

          {error && <div className="text-sm text-rose-600">{error}</div>}

          <button className="bg-accent text-white px-4 py-2 rounded w-full">Login</button>
        </form>
      </div>
    </div>
  );
}