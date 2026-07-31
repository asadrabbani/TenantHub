import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '')
  .replace(/\/$/, '');

export default function PropertyForm({ property, isEditing }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    type: property?.type || 'apartment',
    price: property?.price || '',
    location: {
      address: property?.location?.address || '',
      coordinates: {
        lat: property?.location?.coordinates?.lat || '',
        lng: property?.location?.coordinates?.lng || ''
      }
    },
    amenities: property?.amenities || [],
    images: property?.images || []
  });

  const amenitiesList = [
    'wifi', 'parking', 'gym', 'pool', 'laundry', 
    'security', 'elevator', 'balcony', 'furnished',
    'air_conditioning', 'heating', 'kitchen', 'garden'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          [name]: value
        }
      }
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    // Handle image upload logic here
    // You'll need to implement the image upload endpoint
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing 
        ? `${API_BASE}/api/properties/${property._id}`
        : `${API_BASE}/api/properties`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save property');
      }

      const data = await response.json();
      toast.success(isEditing ? 'Property updated successfully!' : 'Property created successfully!');
      navigate('/properties');
    } catch (error) {
      toast.error(error.message || 'Error saving property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">
          {isEditing ? 'Edit Property' : 'Create New Property'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 bg-dark-900 border border-gray-700 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 bg-dark-900 border border-gray-700 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 bg-dark-900 border border-gray-700 rounded-md"
                required
              >
                <option value="apartment">Apartment</option>
                <option value="garage">Garage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price (per month)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 bg-dark-900 border border-gray-700 rounded-md"
                required
                min="0"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Location</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                className="w-full p-2 bg-dark-900 border border-gray-700 rounded-md"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input
                  type="number"
                  name="lat"
                  value={formData.location.coordinates.lat}
                  onChange={handleCoordinateChange}
                  step="any"
                  className="w-full p-2 bg-dark-900 border border-gray-700 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input
                  type="number"
                  name="lng"
                  value={formData.location.coordinates.lng}
                  onChange={handleCoordinateChange}
                  step="any"
                  className="w-full p-2 bg-dark-900 border border-gray-700 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {amenitiesList.map(amenity => (
                <label key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="form-checkbox bg-dark-900 border-gray-700"
                  />
                  <span className="text-sm capitalize">
                    {amenity.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Images</h2>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-dark-800 file:text-white
                hover:file:bg-dark-700"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Property' : 'Create Property')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/properties')}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
