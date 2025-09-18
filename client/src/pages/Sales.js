import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
const API = process.env.REACT_APP_API || 'http://localhost:4000/api';

export default function Sales(){
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ itemId: '', quantity: 1, customer: '' });
  const [sales, setSales] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(()=>{ fetchItems(); fetchSales(); }, []);

  async function fetchItems(){
    const r = await fetch(`${API}/inventory`, { headers:{ Authorization: `Bearer ${token}` }});
    setItems(await r.json());
  }

  async function fetchSales(){
    const r = await fetch(`${API}/sales`, { headers:{ Authorization: `Bearer ${token}` }});
    setSales(await r.json());
  }

  async function submit(e){
    e.preventDefault();
    const r = await fetch(`${API}/sales`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify(form) });
    const d = await r.json();
    if (!r.ok) return alert(d.message || 'Error');
    setForm({ itemId:'', quantity:1, customer:'' });
    fetchItems(); fetchSales();
  }

  return (
    <div style={{padding:20}}>
      <header><h2>Sales</h2><Link to="/">Back</Link></header>

      <form onSubmit={submit} style={{marginTop:12}}>
        <div>
          <select value={form.itemId} onChange={e=>setForm({...form, itemId:e.target.value})} required>
            <option value="">Select item</option>
            {items.map(i=> <option key={i.id} value={i.id}>{i.name} — {i.quantity} in stock</option>)}
          </select>
        </div>
        <div><input type="number" value={form.quantity} min="1" onChange={e=>setForm({...form, quantity:parseInt(e.target.value||1)})} required /></div>
        <div><input placeholder="Customer" value={form.customer} onChange={e=>setForm({...form, customer:e.target.value})} /></div>
        <div><button type="submit">Record sale</button></div>
      </form>

      <h3 style={{marginTop:20}}>Recent sales</h3>
      <table border="1" cellPadding="6">
        <thead><tr><th>Date</th><th>Item</th><th>Qty</th><th>Total</th><th>Customer</th></tr></thead>
        <tbody>
          {sales.map(s => <tr key={s.id}><td>{s.date}</td><td>{s.Item?.name}</td><td>{s.quantity}</td><td>{s.totalPrice}</td><td>{s.customer}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}