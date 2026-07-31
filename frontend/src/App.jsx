import React from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, CalendarCheck, MapPinned, Search, ShieldCheck } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Properties from './pages/properties/Properties';
import PropertyDetails from './pages/properties/PropertyDetails';
import Dashboard from './pages/dashboard/Dashboard';
import BookingPage from './pages/bookings/BookingPage';
import PaymentPage from './pages/payments/PaymentPage';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CommutePage from './pages/commute/CommutePage';
import CreateProperty from './pages/properties/CreateProperty';
import EditProperty from './pages/properties/EditProperty';

const stats = [
  ['6', 'verified listings'],
  ['4.5', 'average rating'],
  ['12 min', 'average campus commute'],
];

function HomePage() {
  const navigate = useNavigate();
  const handleSearch = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    if (form.get('search')) params.set('search', form.get('search'));
    if (form.get('type')) params.set('type', form.get('type'));
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <>
      <section className="home-hero">
        <div className="site-shell hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">Renting for academic life</p>
            <h1>A better place to live, closer to where you learn.</h1>
            <p className="hero-intro">Compare trusted apartments and parking near campus. See the full monthly cost, commute context, and availability before you request a visit.</p>
            <form className="home-search" onSubmit={handleSearch}>
              <label>
                <span>Area or landmark</span>
                <input name="search" placeholder="Try University Avenue" />
              </label>
              <label>
                <span>Property type</span>
                <select name="type"><option value="">Any property</option><option value="apartment">Apartment</option><option value="garage">Parking garage</option></select>
              </label>
              <button className="button button-primary" type="submit"><Search size={18} /> Search homes</button>
            </form>
            <div className="stat-row">
              {stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
            </div>
          </div>
          <aside className="hero-visual" aria-label="TenantHub service overview">
            <div className="visual-number">01</div>
            <p className="eyebrow light">A clearer rental decision</p>
            <h2>Know the commute. Understand the cost. Meet the owner.</h2>
            <div className="visual-checks">
              <span><ShieldCheck size={18} /> Owner and listing details</span>
              <span><MapPinned size={18} /> Campus and amenity distance</span>
              <span><CalendarCheck size={18} /> Visit and rental requests</span>
            </div>
            <Link to="/properties" className="text-link light">Browse all listings <ArrowRight size={17} /></Link>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="site-shell">
          <div className="section-heading"><div><p className="eyebrow">Built around real decisions</p><h2>Less searching. More certainty.</h2></div><p>TenantHub brings the important parts of renting into one flow, designed for students, teachers, and property owners.</p></div>
          <div className="feature-grid">
            <article><span>01</span><Building2 /><h3>Verified details</h3><p>Review availability, specifications, amenities, owner information, and transparent monthly pricing.</p></article>
            <article><span>02</span><MapPinned /><h3>Commute context</h3><p>Compare campus travel time and nearby services before adding a property to your shortlist.</p></article>
            <article><span>03</span><CalendarCheck /><h3>Guided booking</h3><p>Schedule a viewing or submit a rental request with dates, notes, and a clear status trail.</p></article>
          </div>
        </div>
      </section>

      <section className="section section-sage">
        <div className="site-shell split-cta"><div><p className="eyebrow">For property owners</p><h2>Manage listings without losing the human context.</h2></div><div><p>Track availability, review booking requests, and understand property performance from one focused dashboard.</p><Link className="button button-dark" to="/register">List a property</Link></div></div>
      </section>
    </>
  );
}

function AccountPage({ title, copy }) {
  const { user } = useAuth();
  return <main className="section"><div className="site-shell narrow"><p className="eyebrow">Tenant workspace</p><h1 className="page-title">{title}</h1><div className="surface empty-state"><h2>{user ? `Hello, ${user.name}` : title}</h2><p>{copy}</p><Link className="button button-primary" to="/properties">Explore listings</Link></div></div></main>;
}

function NotFound() {
  return <main className="section"><div className="site-shell narrow empty-state"><p className="eyebrow">404</p><h1 className="page-title">This page moved out.</h1><p>Let’s get you back to available listings.</p><Link className="button button-primary" to="/properties">Browse properties</Link></div></main>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: '#173a35', color: '#fff' } }} />
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/create" element={<CreateProperty />} />
          <Route path="/properties/edit/:id" element={<EditProperty />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/booking/:propertyId" element={<BookingPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/commute" element={<CommutePage />} />
          <Route path="/bookings" element={<AccountPage title="Your bookings" copy="View visit requests, rental applications, payment status, and completed stays in one place." />} />
          <Route path="/reviews" element={<AccountPage title="Reviews" copy="Verified reviews become available after a completed booking." />} />
          <Route path="/profile" element={<AccountPage title="Profile and preferences" copy="Keep your contact details, preferred areas, price range, and amenities current." />} />
          <Route path="/notifications" element={<AccountPage title="Notifications" copy="Booking decisions, payment updates, and owner messages appear here." />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
