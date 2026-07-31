import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const dashboard = user?.role === 'admin' ? '/admin-dashboard' : user?.role === 'owner' ? '/owner-dashboard' : '/dashboard';
  const close = () => setOpen(false);
  const signOut = () => { logout(); close(); navigate('/'); };

  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link className="brand" to="/" onClick={close}><span className="brand-mark">T</span><span><strong>TenantHub</strong><small>Campus rentals</small></span></Link>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
        <nav className={open ? 'nav-links open' : 'nav-links'} aria-label="Primary navigation">
          <NavLink to="/properties" onClick={close}>Properties</NavLink>
          <NavLink to="/commute" onClick={close}>Commute</NavLink>
          {isAuthenticated && <NavLink to={dashboard} onClick={close}>Dashboard</NavLink>}
          {isAuthenticated && <NavLink to="/bookings" onClick={close}>Bookings</NavLink>}
        </nav>
        <div className="header-actions">
          {isAuthenticated ? <><span className="user-label">{user?.name}</span><button className="button button-small button-outline" onClick={signOut}>Sign out</button></> : <><Link to="/login" className="quiet-link">Sign in</Link><Link to="/register" className="button button-small button-primary">Create account</Link></>}
        </div>
      </div>
    </header>
  );
}
