import React, { useState } from 'react';
import { useDataState } from '../context/DataContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useDataState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      await register({ email, password });
      nav('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <h2>Registration</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email" required
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <label>Password</label>
          <input
            type="password" required
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Log in instead</Link>
        </p>
      </div>
    </div>
  );
}
