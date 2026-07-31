import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI, propertiesAPI } from '../../services/api';

export default function BookingPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ bookingType: 'visit', visitDate: '', visitTimeSlot: 'afternoon', startDate: '', duration: 6, userMessage: '', preferredContactTime: 'weekdays' });

  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: `/booking/${propertyId}` } });
      return;
    }
    let active = true;
    propertiesAPI.getById(propertyId)
      .then(response => active && setProperty(response.data.data))
      .catch(error => { toast.error(error.userMessage || 'This property could not be loaded.'); navigate('/properties', { replace: true }); })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [authLoading, isAuthenticated, navigate, propertyId]);

  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async event => {
    event.preventDefault();
    const minimumStay = property?.availability?.minimumStay || 1;
    if (form.bookingType === 'rent' && Number(form.duration) < minimumStay) {
      toast.error(`The minimum stay is ${minimumStay} months.`);
      return;
    }
    const payload = { propertyId, bookingType: form.bookingType, userMessage: form.userMessage, preferredContactTime: form.preferredContactTime };
    if (form.bookingType === 'visit') Object.assign(payload, { visitDate: form.visitDate, visitTimeSlot: form.visitTimeSlot });
    else Object.assign(payload, { totalMonths: Number(form.duration), startDate: form.startDate });

    try {
      setSubmitting(true);
      await bookingsAPI.create(payload);
      toast.success('Your request was sent for review.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.userMessage || 'We could not submit this request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) return <main className="loading-grid">Loading booking details…</main>;
  if (!property) return null;

  return (
    <main>
      <section className="page-hero booking-hero">
        <div className="site-shell">
          <p className="eyebrow">Booking request</p>
          <h1>Choose the next step for this property.</h1>
          <p>Request a visit or apply to rent. The owner confirms availability and terms before any payment is requested.</p>
        </div>
      </section>
      <section className="section">
        <div className="site-shell request-layout">
          <form className="surface request-form" onSubmit={submit}>
            <div className="request-type" role="group" aria-label="Request type">
              <label className={form.bookingType === 'visit' ? 'selected' : ''}><input type="radio" name="bookingType" value="visit" checked={form.bookingType === 'visit'} onChange={update} /><CalendarDays size={20} /><strong>Schedule a visit</strong><span>See the property before deciding.</span></label>
              <label className={form.bookingType === 'rent' ? 'selected' : ''}><input type="radio" name="bookingType" value="rent" checked={form.bookingType === 'rent'} onChange={update} /><ShieldCheck size={20} /><strong>Request to rent</strong><span>Start an owner-reviewed application.</span></label>
            </div>

            {form.bookingType === 'visit' ? <div className="form-row">
              <label className="field"><span>Preferred date</span><input required type="date" min={tomorrow} name="visitDate" value={form.visitDate} onChange={update} /></label>
              <label className="field"><span>Time window</span><select name="visitTimeSlot" value={form.visitTimeSlot} onChange={update}><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option></select></label>
            </div> : <div className="form-row">
              <label className="field"><span>Move-in date</span><input required type="date" min={tomorrow} name="startDate" value={form.startDate} onChange={update} /></label>
              <label className="field"><span>Rental duration</span><select name="duration" value={form.duration} onChange={update}>{[3,6,9,12,18,24].map(months => <option key={months} value={months}>{months} months</option>)}</select></label>
            </div>}

            <label className="field"><span>Best contact time</span><select name="preferredContactTime" value={form.preferredContactTime} onChange={update}><option value="weekdays">Weekdays</option><option value="evenings">Evenings</option><option value="weekends">Weekends</option></select></label>
            <label className="field"><span>Message for the owner (optional)</span><textarea maxLength="500" name="userMessage" value={form.userMessage} onChange={update} placeholder="Share any timing, accessibility, or rental questions." /></label>
            <button className="button button-primary" disabled={submitting} type="submit">{submitting ? 'Sending request…' : 'Submit request'}</button>
          </form>

          <aside className="surface request-summary">
            <p className="eyebrow">Your selection</p>
            <h2>{property.title}</h2>
            <p className="summary-location"><MapPin size={16} /> {property.location?.address}</p>
            <div className="summary-price"><strong>৳{Number(property.price).toLocaleString()}</strong><span>per month</span></div>
            <dl><div><dt>Type</dt><dd>{property.type}</dd></div><div><dt>Minimum stay</dt><dd>{property.availability?.minimumStay || 1} months</dd></div><div><dt>Status</dt><dd>{property.availability?.isAvailable ? 'Available' : 'Unavailable'}</dd></div></dl>
            <Link className="text-link" to={`/properties/${propertyId}`}>Return to property details</Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
