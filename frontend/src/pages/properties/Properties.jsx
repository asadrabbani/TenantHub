import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../../components/properties/PropertyCard';
import { propertiesAPI } from '../../services/api';
import { demoProperties } from '../../data/demoProperties';
import { useAuth } from '../../context/AuthContext';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [source, setSource] = useState('loading');
  const { user } = useAuth();
  const filters = { search: searchParams.get('search') || '', type: searchParams.get('type') || '', maxPrice: searchParams.get('maxPrice') || '' };

  useEffect(() => {
    let active = true;
    propertiesAPI.getAll({ ...filters, available: true, limit: 24 })
      .then(response => { if (active) { setProperties(response.data.data || []); setSource('live'); } })
      .catch(() => { if (active) { setProperties(demoProperties); setSource('demo'); } });
    return () => { active = false; };
  }, [searchParams]);

  const filtered = useMemo(() => properties.filter(property => {
    const term = filters.search.toLowerCase();
    const matchesTerm = !term || `${property.title} ${property.location?.address}`.toLowerCase().includes(term);
    const matchesType = !filters.type || property.type === filters.type;
    const matchesPrice = !filters.maxPrice || property.price <= Number(filters.maxPrice);
    return matchesTerm && matchesType && matchesPrice;
  }), [properties, filters.search, filters.type, filters.maxPrice]);

  const submit = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    for (const key of ['search','type','maxPrice']) if (data.get(key)) next.set(key, data.get(key));
    setSearchParams(next);
  };

  return <>
    <section className="page-hero"><div className="site-shell"><p className="eyebrow">Property directory</p><h1>Homes selected for how students actually live.</h1><p>Filter by location, type, and monthly budget. Every card keeps the commute, availability, and real cost visible.</p></div></section>
    <main className="section"><div className="site-shell">
      <form className="surface filters-panel" onSubmit={submit}>
        <div className="field"><label htmlFor="search">Area, landmark, or title</label><input id="search" name="search" defaultValue={filters.search} placeholder="University Avenue" /></div>
        <div className="field"><label htmlFor="type">Property type</label><select id="type" name="type" defaultValue={filters.type}><option value="">All types</option><option value="apartment">Apartment</option><option value="garage">Parking</option></select></div>
        <div className="field"><label htmlFor="maxPrice">Maximum monthly rent</label><input id="maxPrice" name="maxPrice" type="number" min="0" defaultValue={filters.maxPrice} placeholder="35000" /></div>
        <button className="button button-primary" type="submit">Apply filters</button>
      </form>
      <div className="results-bar"><strong>{source === 'loading' ? 'Loading listings…' : `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'}`}</strong><span>{source === 'demo' ? 'Preview data · API unavailable' : 'Live availability'}</span></div>
      {source === 'loading' ? <div className="surface loading-grid">Preparing available properties…</div> : filtered.length ? <div className="property-grid">{filtered.map(property => <PropertyCard key={property._id} property={property} currentUserId={user?._id || user?.id} isAdmin={user?.role === 'admin'} />)}</div> : <div className="surface empty-state"><h2>No exact match yet</h2><p>Try a broader area or remove one of the filters.</p><button className="button button-outline" onClick={() => setSearchParams({})}>Clear filters</button></div>}
    </div></main>
  </>;
}
