import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";

const API = process.env.REACT_APP_API || "http://localhost:4000/api";

export default function SalesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ itemId: "", quantity: 1, customer: "" });
  const [sales, setSales] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchItems();
    fetchSales();
  }, []);

  async function fetchItems() {
    const r = await fetch(`${API}/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) setItems(await r.json());
  }

  async function fetchSales() {
    const r = await fetch(`${API}/sales`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) setSales(await r.json());
  }

  async function submit(e) {
    e.preventDefault();
    const r = await fetch(`${API}/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (!r.ok) return alert(d.message || "Error");

    setForm({ itemId: "", quantity: 1, customer: "" });
    fetchItems();
    fetchSales();
  }

  async function uploadExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const r = await fetch(`${API}/sales/upload-excel`, {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });

    const d = await r.json();
    if (!r.ok) return alert(d.message || "Upload failed");

    alert("✅ Excel uploaded successfully!");
    fetchItems();
    fetchSales();
  }

  return (
    <div>
      <NavBar />
      <main className="app-container mt-6">
        <h2 className="text-xl font-semibold mb-4">Sales</h2>

        {/* Record sale form */}
        <div className="card">
          <h3 className="font-medium mb-2">Record sale</h3>
          <form
            onSubmit={submit}
            className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm text-slate-600 mb-1">Item</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.itemId}
                onChange={(e) =>
                  setForm({ ...form, itemId: e.target.value })
                }
                required
              >
                <option value="">Select item</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} — {i.quantity} in stock
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                className="w-full border rounded px-3 py-2"
                value={form.quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity: parseInt(e.target.value || 1),
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Customer
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Customer"
                value={form.customer}
                onChange={(e) =>
                  setForm({ ...form, customer: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-3">
              <button className="bg-accent text-white px-4 py-2 rounded w-full">
                Record Sale
              </button>
            </div>
          </form>
        </div>

        {/* Upload Excel */}
        <div className="card mt-4">
          <h3 className="font-medium mb-2">Bulk Upload</h3>
          <input type="file" accept=".xlsx,.xls" onChange={uploadExcel} />
        </div>

        {/* Recent sales table */}
        <div className="card mt-4">
          <h3 className="font-medium mb-2">Recent Sales</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-100 text-slate-600 text-sm">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Customer</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-3 py-2">{s.date}</td>
                    <td className="px-3 py-2">{s.Item?.name || "—"}</td>
                    <td className="px-3 py-2">{s.quantity}</td>
                    <td className="px-3 py-2">
                      ₱{Number(s.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">{s.customer}</td>
                  </tr>
                ))}
                {!sales.length && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-3 text-slate-500"
                    >
                      No sales yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}