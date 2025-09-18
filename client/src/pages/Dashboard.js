import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/auth';

const API = process.env.REACT_APP_API || 'http://localhost:4000/api';

export default function Dashboard(){
  const { logout } = useAuth();
  const [items, setItems] = useState([]);
  const [monthly, setMonthly] = useState([]);

  useEffect(()=>{ fetchItems(); fetchMonthly(); }, []);

  async function fetchItems(){
    const token = localStorage.getItem('token');
    const r = await fetch(`${API}/inventory`, { headers:{ Authorization: `Bearer ${token}` }});
    const d = await r.json(); setItems(d);
  }

  async function fetchMonthly(){
    const token = localStorage.getItem('token');
    const r = await fetch(`${API}/sales/reports/monthly`, { headers:{ Authorization: `Bearer ${token}` }});
    const d = await r.json(); setMonthly(d);
  }

  return (
    <div style={{padding:20}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1>Dashboard</h1>
        <div>
          <Link to="/inventory">Inventory</Link> | <Link to="/sales">Sales</Link> | <button onClick={logout}>Logout</button>
        </div>
      </header>

      <section style={{marginTop:20}}>
        <h3>Low stock (less than 5)</h3>
        <ul>
          {items.filter(i=>i.quantity<5).map(i => <li key={i.id}>{i.name} — {i.quantity}</li>)}
          {items.filter(i=>i.quantity<5).length===0 && <li>None</li>}
        </ul>
      </section>

      <section style={{marginTop:20}}>
        <h3>Monthly sales</h3>
        <table border="1" cellPadding="6">
          <thead><tr><th>Month</th><th>Total</th></tr></thead>
          <tbody>
            {monthly.map(m => <tr key={m.month}><td>{m.month}</td><td>{m.total.toFixed(2)}</td></tr>)}
            {monthly.length===0 && <tr><td colSpan="2">No data</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}