import React, { useEffect, useState } from 'react';
import { Bath, BedDouble, Clock3, MapPin, Ruler, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { propertiesAPI } from '../../services/api';
import { findDemoProperty } from '../../data/demoProperties';

const fallback = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=82&auto=format&fit=crop';
const money = value => new Intl.NumberFormat('en-BD').format(value || 0);

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    propertiesAPI.getById(id)
      .then(response => { if (active) setProperty(response.data.data); })
      .catch(() => { if (active) setProperty(findDemoProperty(id)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <main className="section"><div className="site-shell surface loading-grid">Preparing property details…</div></main>;
  if (!property) return <main className="section"><div className="site-shell narrow surface empty-state"><h1>Property not found</h1><p>This listing may no longer be active.</p><Link className="button button-primary" to="/properties">Back to properties</Link></div></main>;

  const specs = property.specifications || {};
  const location = property.location || {};
  const image = property.images?.find(item => item.isPrimary)?.url || property.images?.[0]?.url || fallback;
  return <>
    <section className="page-hero"><div className="site-shell">
      <div className="detail-top"><div><p className="eyebrow">{property.type} · {property.availability?.isAvailable ? 'Available now' : 'Join the waitlist'}</p><h1>{property.title}</h1><div className="detail-meta"><span><MapPin size={13} /> {location.address}</span><span><Star size={13} fill="currentColor" /> {property.ratings?.average || 'New listing'} ({property.ratings?.count || 0})</span><span>Minimum stay {property.availability?.minimumStay || 1} month{property.availability?.minimumStay === 1 ? '' : 's'}</span></div></div><Link className="button button-primary" to={`/booking/${property._id}`}>Request a visit</Link></div>
    </div></section>
    <main className="section"><div className="site-shell">
      <div className="detail-image"><img src={image} alt={property.images?.[0]?.alt || property.title} /></div>
      <div className="detail-layout">
        <div className="detail-stack">
          <section className="surface content-card"><p className="eyebrow">Property overview</p><h2>A practical place to settle in.</h2><p>{property.description}</p></section>
          <section className="surface content-card"><h2>At a glance</h2><div className="facts-grid">{property.type === 'apartment' && <><div className="fact"><BedDouble size={19} /><strong>{specs.bedrooms || 0}</strong><span>Bedrooms</span></div><div className="fact"><Bath size={19} /><strong>{specs.bathrooms || 0}</strong><span>Bathrooms</span></div></>}<div className="fact"><Ruler size={19} /><strong>{specs.area || '—'}</strong><span>Square feet</span></div><div className="fact"><Clock3 size={19} /><strong>{location.nearbyPlaces?.campus?.duration || 'Ask owner'}</strong><span>Campus commute</span></div></div></section>
          <section className="surface content-card"><h2>Included amenities</h2><div className="amenity-list">{(property.amenities || []).map(amenity => <span key={amenity}>{amenity.replaceAll('_',' ')}</span>)}</div></section>
          {location.nearbyPlaces?.mosque && <section className="surface content-card"><h2>Nearby essentials</h2><p><strong>{location.nearbyPlaces.mosque.name}</strong> is approximately {location.nearbyPlaces.mosque.duration || `${location.nearbyPlaces.mosque.distance} km away`}.</p></section>}
        </div>
        <aside className="surface booking-card"><p className="eyebrow">Monthly rent</p><div className="price">৳{money(property.price)} <small>/ month</small></div><p>Availability and final terms are confirmed by the property owner after your request.</p><div className="owner-line"><span className="owner-avatar">{property.owner?.name?.charAt(0) || 'O'}</span><div><strong>{property.owner?.name || 'Verified owner'}</strong><small>Property contact</small></div></div><Link className="button button-primary" to={`/booking/${property._id}`}>Schedule visit or rent</Link><p className="form-note" style={{marginTop:14}}>No payment is taken until your request is confirmed.</p></aside>
      </div>
    </div></main>
  </>;
}
