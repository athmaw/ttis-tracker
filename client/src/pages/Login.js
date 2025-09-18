import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';

const API = process.env.REACT_APP_API || 'http://localhost:4000/api';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { save } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState('');

  async function submit(e){
    e.preventDefault();
    setErr('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      save(data.token, data.user);
      nav('/');
    } catch (error) {
      setErr(error.message);
    }
  }

  return (
    <div style={{padding:20, maxWidth:420, margin:'50px auto', border:'1px solid #ddd', borderRadius:8}}>
      <h2>Techno-Tool Sales Tracker — Login</h2>
      <form onSubmit={submit}>
        <div>
          <label>Email</label><br />
          <input value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div style={{marginTop:8}}>
          <label>Password</label><br />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <div style={{marginTop:12}}>
          <button type="submit">Login</button>
        </div>
        {err && <div style={{color:'red', marginTop:8}}>{err}</div>}
        <div style={{marginTop:10, color:'#666', fontSize:12}}>Seed admin: admin@technotool.local / admin123</div>
      </form>
    </div>
  );
}