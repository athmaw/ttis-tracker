import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useAuth } from "../utils/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

  // Format month YYYY-MM → "September 2025"
  const formatMonth = (monthStr) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  // Prepare chart data
  const chartData = monthly.map((row) => ({
    month: formatMonth(row.month),
    total: Number(row.total),
  }));

  return (
    <div>
      <NavBar />
      <main className="app-container mt-6">
        {/* Top summary cards */}
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
              {items
                .filter((i) => i.quantity < 5)
                .slice(0, 5)
                .map((i) => (
                  <li
                    key={i.id}
                    className="flex justify-between text-sm py-1 text-red-500"
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
          <table className="w-full text-left mb-6">
            <thead className="text-sm text-slate-500">
              <tr>
                <th className="py-2">Month</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {monthly.length ? (
                monthly.map((m) => (
                  <tr key={m.month} className="border-t">
                    <td className="py-2">{formatMonth(m.month)}</td>
                    <td className="py-2">₱{Number(m.total).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-slate-500">No data</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₱${value.toFixed(2)}`} />
                  <Bar dataKey="total" fill="#0d9488" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}