import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || '/dashboard';

  useEffect(() => { if (isAuthenticated) navigate(destination, { replace: true }); }, [isAuthenticated, navigate, destination]);
  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault(); setError('');
    if (!form.email || form.password.length < 6) return setError('Enter a valid email and a password of at least 6 characters.');
    const result = await login(form);
    if (!result.success) setError(result.error);
  };

  return <main className="auth-page">
    <aside className="auth-aside"><div><p className="eyebrow light">Welcome back</p><h1>Your shortlist and rental journey, in one place.</h1><p>Return to bookings, property requests, commute routes, and account preferences.</p></div></aside>
    <div className="auth-form-wrap"><form className="surface auth-form form-stack" onSubmit={submit}>
      <div><p className="eyebrow">Student and owner access</p><h2>Sign in</h2></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={change} required /></div>
      <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={change} minLength="6" required /></div>
      <button className="button button-primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in securely'}</button>
      <p className="form-note">New to TenantHub? <Link to="/register">Create an account</Link>.</p>
      <p className="form-note">Demo account: student@tenanthub.test · TenantHub123!</p>
    </form></div>
  </main>;
}
