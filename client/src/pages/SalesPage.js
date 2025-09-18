import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";

const API = process.env.REACT_APP_API || "http://localhost:4000/api";

export default function SalesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ itemId: "", quantity: 1, customer: "" });
  const [sales, setSales] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchItems(); fetchSales(); }, []);

  async function fetchItems() {
    const token = localStorage.getItem("token");
    const r = await fetch(`${API}/inventory`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) setItems(await r.json());
  }

  async function fetchSales() {
    const token = localStorage.getItem("token");
    const r = await fetch(`${API}/sales`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) setSales(await r.json());
  }

  async function submit(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const url = editingId ? `${API}/sales/${editingId}` : `${API}/sales`;
    const method = editingId ? "PUT" : "POST";

    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    const data = await r.json();
    if (!r.ok) return alert(data.message || "Failed");

    setForm({ itemId: "", quantity: 1, customer: "" });
    setEditingId(null);
    fetchItems(); fetchSales();
  }

  function startEdit(sale) {
    setForm({
      itemId: sale.itemId,
      quantity: sale.quantity,
      customer: sale.customer
    });
    setEditingId(sale.id);
  }

  function cancelEdit() {
    setForm({ itemId: "", quantity: 1, customer: "" });
    setEditingId(null);
  }

  async function remove(id) {
    if (!window.confirm("Delete this sale?")) return;
    const token = localStorage.getItem("token");
    const r = await fetch(`${API}/sales/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (r.ok) fetchSales();
  }

  return (
    <div>
      <NavBar />
      <main className="app-container mt-6">
        {/* Record or Edit sale */}
        <div className="card">
          <h3 className="text-lg font-semibold">{editingId ? "Edit sale" : "Record sale"}</h3>
          <form onSubmit={submit} className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Item</label>
              <select className="w-full border rounded px-3 py-2" required
                value={form.itemId} onChange={e => setForm({ ...form, itemId: e.target.value })}>
                <option value="">Select item</option>
                {items.map(i => (
                  <option key={i.id} value={i.id}>{i.name} — {i.quantity} in stock</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Quantity</label>
              <input type="number" className="w-full border rounded px-3 py-2" min="1"
                value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value || 1) })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Customer</label>
              <input className="w-full border rounded px-3 py-2" placeholder="Customer"
                value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} />
            </div>

            <div className="md:col-span-3 flex gap-2">
              <button className="bg-accent text-white px-4 py-2 rounded w-full">
                {editingId ? "Update" : "Record"}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit}
                  className="bg-slate-300 px-4 py-2 rounded w-full">Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* Recent sales */}
        <div className="card mt-4">
          <h3 className="font-medium mb-2">Recent sales</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 text-slate-600 text-sm">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Item</th>
                  <th className="py-2 px-3">Qty</th>
                  <th className="py-2 px-3">Total</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="py-2 px-3">{s.date}</td>
                    {/* ✅ Show item name */}
                    <td className="py-2 px-3">{s.Item?.name || "—"}</td>
                    <td className="py-2 px-3">{s.quantity}</td>
                    <td className="py-2 px-3">₱{Number(s.totalPrice).toFixed(2)}</td>
                    <td className="py-2 px-3">{s.customer}</td>
                    <td className="py-2 px-3 flex gap-2">
                      <button onClick={() => startEdit(s)} className="text-blue-600 text-sm">Edit</button>
                      <button onClick={() => remove(s.id)} className="text-rose-600 text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
                {!sales.length && (
                  <tr><td colSpan="6" className="py-3 text-center text-slate-500">No sales yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}