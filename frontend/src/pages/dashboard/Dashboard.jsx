import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, House, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI, propertiesAPI } from '../../services/api';
import PropertyCard from '../../components/properties/PropertyCard';

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/login', { replace: true });
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    Promise.allSettled([bookingsAPI.myBookings(), propertiesAPI.recommendations()])
      .then(([bookingResult, propertyResult]) => {
        if (!active) return;
        if (bookingResult.status === 'fulfilled') setBookings(bookingResult.value.data.data || []);
        if (propertyResult.status === 'fulfilled') setRecommendations(propertyResult.value.data.data || []);
      })
      .finally(() => active && setLoadingData(false));
    return () => { active = false; };
  }, [isAuthenticated]);

  const stats = useMemo(() => ({
    total: bookings.length,
    active: bookings.filter(item => ['pending', 'confirmed'].includes(item.status)).length,
    completed: bookings.filter(item => item.status === 'completed').length,
  }), [bookings]);

  if (loading || loadingData) return <main className="loading-grid">Preparing your dashboard…</main>;
  if (!isAuthenticated) return null;

  return (
    <main>
      <section className="dashboard-hero">
        <div className="site-shell dashboard-heading">
          <div>
            <p className="eyebrow">Your TenantHub</p>
            <h1>Welcome back, {user?.name?.split(' ')[0]}.</h1>
            <p>Keep an eye on every request, then continue your search when you are ready.</p>
          </div>
          <div className="account-note"><strong>{user?.name}</strong><span>{user?.email}</span></div>
        </div>
      </section>

      <section className="section">
        <div className="site-shell">
          <div className="dashboard-stats" aria-label="Booking summary">
            <Stat icon={CalendarDays} value={stats.total} label="Total requests" />
            <Stat icon={Clock3} value={stats.active} label="In progress" />
            <Stat icon={CheckCircle2} value={stats.completed} label="Completed" />
            <Stat icon={House} value={recommendations.length} label="Matched homes" />
          </div>

          <div className="dashboard-section-head">
            <div><p className="eyebrow">Recent activity</p><h2>Your booking requests</h2></div>
            <Link className="text-link" to="/bookings">View all <ArrowRight size={16} /></Link>
          </div>

          {bookings.length ? (
            <div className="booking-list">
              {bookings.slice(0, 4).map(booking => (
                <Link to={`/bookings/${booking._id}`} className="booking-row" key={booking._id}>
                  <div>
                    <strong>{booking.property?.title || 'Property request'}</strong>
                    <span><MapPin size={14} /> {booking.property?.location?.address || 'Location pending'}</span>
                  </div>
                  <div className="booking-row-meta"><span className={`status-pill status-${booking.status}`}>{booking.status}</span><small>{new Date(booking.createdAt).toLocaleDateString()}</small></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="surface empty-state"><h3>No requests yet</h3><p>Explore available homes and schedule a visit when one feels right.</p><Link className="button button-primary" to="/properties">Browse properties</Link></div>
          )}

          <div className="dashboard-section-head recommendations-head">
            <div><p className="eyebrow">Selected for you</p><h2>Recommended listings</h2></div>
            <Link className="text-link" to="/properties">Browse directory <ArrowRight size={16} /></Link>
          </div>
          {recommendations.length ? <div className="property-grid">{recommendations.slice(0, 3).map(property => <PropertyCard key={property._id} property={property} />)}</div> : <div className="surface empty-state"><p>Add your preferences to receive more focused recommendations.</p><Link className="button button-outline" to="/properties">Explore all listings</Link></div>}
        </div>
      </section>
    </main>
  );
}

function Stat({ icon: Icon, value, label }) {
  return <article><Icon size={20} /><strong>{value}</strong><span>{label}</span></article>;
}
