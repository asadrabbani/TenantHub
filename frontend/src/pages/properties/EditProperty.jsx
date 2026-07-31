import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropertyForm from './PropertyForm';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '')
  .replace(/\/$/, '');

export default function EditProperty() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/properties/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch property');
        }

        const data = await response.json();
        setProperty(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 text-gray-100 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 text-gray-100 flex items-center justify-center text-red-400">
        Error: {error}
      </div>
    );
  }

  return <PropertyForm property={property} isEditing={true} />;
}
