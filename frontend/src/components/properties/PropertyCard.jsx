import React from 'react';
import { Bath, BedDouble, MapPin, Ruler, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const fallback = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=82&auto=format&fit=crop';
const money = value => new Intl.NumberFormat('en-BD').format(value || 0);

export default function PropertyCard({ property, isAdmin, currentUserId, onDelete }) {
  const image = property.images?.find(item => item.isPrimary)?.url || property.images?.[0]?.url || fallback;
  const ownerId = property.owner?._id || property.owner;
  const canManage = isAdmin || (currentUserId && ownerId === currentUserId);
  return <article className="property-card">
    <Link to={`/properties/${property._id}`}>
      <div className="property-image"><img src={image} alt={property.images?.[0]?.alt || property.title} /><span className="property-badge">{property.availability?.isAvailable ? property.type : 'Currently unavailable'}</span></div>
      <div className="property-body">
        <p className="property-location"><MapPin size={13} /> {property.location?.address}</p>
        <h3>{property.title}</h3>
        <div className="property-facts">
          {property.type === 'apartment' && <><span><BedDouble size={15} /> {property.specifications?.bedrooms || 0} bed</span><span><Bath size={15} /> {property.specifications?.bathrooms || 0} bath</span></>}
          <span><Ruler size={15} /> {property.specifications?.area || '—'} sq ft</span>
        </div>
        <div className="property-footer"><div className="property-price"><strong>৳{money(property.price)}</strong><span>per month</span></div><div className="rating"><Star size={14} fill="currentColor" /> {property.ratings?.average || 'New'} <span>({property.ratings?.count || 0})</span></div></div>
      </div>
    </Link>
    {canManage && <div className="card-actions"><Link to={`/properties/edit/${property._id}`}>Edit listing</Link>{onDelete && <button onClick={() => onDelete(property._id)}>Remove</button>}</div>}
  </article>;
}
