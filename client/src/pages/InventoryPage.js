import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useAuth } from "../utils/auth";

const API = process.env.REACT_APP_API || "http://localhost:4000/api";

export default function InventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    quantity: 0,
    price: 0,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const token = localStorage.getItem("token");
    const r = await fetch(`${API}/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) setItems(await r.json());
  }

  async function createOrUpdate(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const url = editingId
      ? `${API}/inventory/${editingId}`
      : `${API}/inventory`;
    const method = editingId ? "PUT" : "POST";

    const r = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (r.ok) {
      setForm({ name: "", category: "", description: "", quantity: 0, price: 0 });
      setEditingId(null);
      fetchItems();
    } else {
      const data = await r.json();
      alert(data?.message || "Failed to save item");
    }
  }

  function startEdit(item) {
    setForm({
      name: item.name,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
    });
    setEditingId(item.id);
  }

  function cancelEdit() {
    setForm({ name: "", category: "", description: "", quantity: 0, price: 0 });
    setEditingId(null);
  }

  async function remove(id) {
    if (!window.confirm("Delete this item?")) return;
    const token = localStorage.getItem("token");
    const r = await fetch(`${API}/inventory/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) fetchItems();
  }

  return (
    <div>
      <NavBar />
      <main className="app-container mt-6">
        <h2 className="text-xl font-semibold mb-4">Inventory</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Inventory list */}
          <div className="card">
            <h3 className="font-medium mb-3">Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-600 text-sm">
                  <tr>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Qty</th>
                    <th className="py-2 px-3">Price</th>
                    <th className="py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="border-t">
                      <td className="py-2 px-3">{i.name}</td>
                      <td className="py-2 px-3">{i.quantity}</td>
                      <td className="py-2 px-3">
                        ₱{Number(i.price).toFixed(2)}
                      </td>
                      <td className="py-2 px-3 flex gap-2">
                        {user?.role === "admin" && (
                          <>
                            <button
                              onClick={() => startEdit(i)}
                              className="text-blue-600 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => remove(i.id)}
                              className="text-rose-600 text-sm"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!items.length && (
                    <tr>
                      <td colSpan="4" className="py-3 text-center text-slate-500">
                        No products
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add / Edit product */}
          <div className="card">
            <h3 className="font-medium mb-3">
              {editingId ? "Edit product" : "Add product"}
            </h3>
            <form onSubmit={createOrUpdate} className="space-y-3">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <textarea
                className="w-full border rounded px-3 py-2"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              {/* Quantity & Price with labels */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={form.quantity}
                    min={0}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantity: parseInt(e.target.value || 0),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border rounded px-3 py-2"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: parseFloat(e.target.value || 0),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-accent text-white px-4 py-2 rounded w-full"
                >
                  {editingId ? "Update" : "Add"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-slate-300 px-4 py-2 rounded w-full"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}