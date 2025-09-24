import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useAuth } from "../utils/auth";

const API = process.env.REACT_APP_API || "http://localhost:4000/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [monthly, setMonthly] = useState([]);

  useEffect(() => {
    fetchItems();
    fetchMonthly();
  }, []);

  async function fetchItems() {
    const token = localStorage.getItem("token");
    const r = await fetch(`${API}/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) setItems(await r.json());
  }

  async function fetchMonthly() {
    const token = localStorage.getItem("token");
    const r = await fetch(`${API}/sales/reports/monthly`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) setMonthly(await r.json());
  }

  return (
    <div>
      <NavBar />
      <main className="app-container mt-6">
        {/* Top cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <h3 className="text-sm text-slate-500">Welcome</h3>
            <div className="text-xl font-semibold mt-2">
              {user?.name || user?.email}
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm text-slate-500">Total products</h3>
            <div className="text-2xl font-bold mt-2">{items.length}</div>
          </div>

          <div className="card">
            <h3 className="text-sm text-slate-500">Low stock</h3>
            <ul className="mt-2">
              {items.filter((i) => i.quantity < 5).slice(0, 5).map((i) => (
                <li
                  key={i.id}
                  className="flex justify-between text-sm py-1 text-rose-600"
                >
                  <span>{i.name}</span>
                  <span>{i.quantity}</span>
                </li>
              ))}
              {items.filter((i) => i.quantity < 5).length === 0 && (
                <li className="text-sm text-slate-500">None</li>
              )}
            </ul>
          </div>
        </div>

        {/* Monthly sales */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold mb-3">Monthly sales</h3>
          <table className="w-full text-left border-collapse">
            <thead className="text-sm text-slate-500">
              <tr>
                <th className="py-2 px-3">Month</th>
                <th className="py-2 px-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {monthly.length ? (
                monthly.map((m) => (
                  <tr key={m.month} className="border-t">
                    <td className="py-2 px-3">
                      {new Date(m.month + "-01").toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2 px-3">
                      ₱{Number(m.total).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="2"
                    className="py-3 text-center text-slate-500"
                  >
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}