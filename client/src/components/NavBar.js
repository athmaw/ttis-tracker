import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/auth";
import { FiLogOut, FiBox, FiHome, FiShoppingCart } from "react-icons/fi";

export default function NavBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const doLogout = () => { logout(); nav("/login"); };

  return (
    <header className="bg-white shadow-sm">
      <div className="app-container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-xl font-semibold text-primary">Techno-Tool</div>
          <nav className="hidden sm:flex gap-2 text-sm text-slate-600">
            <Link to="/" className="px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-1"><FiHome/> Dashboard</Link>
            <Link to="/inventory" className="px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-1"><FiBox/> Inventory</Link>
            <Link to="/sales" className="px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-1"><FiShoppingCart/> Sales</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600 hidden sm:block">
            {user ? <>Signed in as <span className="font-medium text-slate-800">{user.name || user.email}</span></> : ""}
          </div>
          <button onClick={doLogout} className="flex items-center gap-2 text-sm text-rose-600 hover:text-white hover:bg-rose-600 px-3 py-2 rounded">
            <FiLogOut/> Logout
          </button>
        </div>
      </div>
    </header>
  );
}