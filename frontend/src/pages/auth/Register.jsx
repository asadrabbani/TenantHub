import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'user', password: '', confirm: '' });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault(); setError('');
    if (!form.name.trim() || !form.email) return setError('Name and email are required.');
    if (form.password.length < 8) return setError('Use at least 8 characters for your password.');
    if (form.password !== form.confirm) return setError('The passwords do not match.');
    const { confirm, ...payload } = form;
    const result = await register(payload);
    if (result.success) navigate(form.role === 'owner' ? '/owner-dashboard' : '/dashboard');
    else setError(result.error);
  };

  return <main className="auth-page">
    <aside className="auth-aside"><div><p className="eyebrow light">Join TenantHub</p><h1>Start with the right account for your role.</h1><p>Tenants can compare and request homes. Owners can publish listings and manage rental interest.</p></div></aside>
    <div className="auth-form-wrap"><form className="surface auth-form form-stack" onSubmit={submit}>
      <div><p className="eyebrow">Account registration</p><h2>Create account</h2></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="form-row"><div className="field"><label htmlFor="name">Full name</label><input id="name" name="name" autoComplete="name" value={form.name} onChange={change} required /></div><div className="field"><label htmlFor="role">I am joining as</label><select id="role" name="role" value={form.role} onChange={change}><option value="user">Student or teacher</option><option value="owner">Property owner</option></select></div></div>
      <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={change} required /></div>
      <div className="field"><label htmlFor="phone">Phone number</label><input id="phone" name="phone" autoComplete="tel" value={form.phone} onChange={change} /></div>
      <div className="form-row"><div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength="8" value={form.password} onChange={change} required /></div><div className="field"><label htmlFor="confirm">Confirm password</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength="8" value={form.confirm} onChange={change} required /></div></div>
      <button className="button button-primary" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create TenantHub account'}</button>
      <p className="form-note">Already registered? <Link to="/login">Sign in</Link>.</p>
    </form></div>
  </main>;
}
