import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
const API = process.env.REACT_APP_API || 'http://localhost:4000/api';
import { useAuth } from '../utils/auth';

export default function Inventory(){
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name:'', category:'', description:'', batchNo:'', quantity:0, price:0 });
  const token = localStorage.getItem('token');

  useEffect(()=> fetchItems(), []);

  async function fetchItems(){
    const r = await fetch(`${API}/inventory`, { headers:{ Authorization: `Bearer ${token}` }});
    const d = await r.json(); setItems(d);
  }

  async function create(e){
    e.preventDefault();
    const r = await fetch(`${API}/inventory`, {
      method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      body: JSON.stringify(form)
    });
    if (r.ok) { setForm({ name:'', category:'', description:'', batchNo:'', quantity:0, price:0 }); fetchItems(); }
    else alert('Failed (admins only)');
  }

  async function remove(id){
    if (!window.confirm('Delete item?')) return;
    const r = await fetch(`${API}/inventory/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` }});
    if (r.ok) fetchItems();
  }

  return (
    <div style={{padding:20}}>
      <header><h2>Inventory</h2><Link to="/">Back</Link></header>

      <table border="1" cellPadding="6" style={{marginTop:10}}>
        <thead><tr><th>Name</th><th>Batch</th><th>Qty</th><th>Price</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(i => <tr key={i.id}><td>{i.name}</td><td>{i.batchNo}</td><td>{i.quantity}</td><td>{i.price}</td>
            <td>{user?.role === 'admin' ? <button onClick={()=>remove(i.id)}>Delete</button>: '—'}</td></tr>)}
        </tbody>
      </table>

      {user?.role === 'admin' && (
        <form onSubmit={create} style={{marginTop:12, maxWidth:600}}>
          <h3>Add item</h3>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required /><br/>
          <input placeholder="Category" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} /><br/>
          <input placeholder="Batch no" value={form.batchNo} onChange={e=>setForm({...form, batchNo:e.target.value})} /><br/>
          <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} /><br/>
          <input type="number" placeholder="Quantity" value={form.quantity} onChange={e=>setForm({...form, quantity:parseInt(e.target.value||0)})} /><br/>
          <input type="number" placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:parseFloat(e.target.value||0)})} step="0.01" /><br/>
          <button type="submit">Add</button>
        </form>
      )}
    </div>
  );
}