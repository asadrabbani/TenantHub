import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI, propertiesAPI, notificationsAPI, dashboardAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    properties: [],
    stats: {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      totalProperties: 0,
      totalRevenue: 0,
      totalCommission: 0
    }
  });
  
  const [bookingFilters, setBookingFilters] = useState({
    status: '',
    type: '',
    page: 1,
    limit: 10
  });
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin account required.');
      navigate('/dashboard');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, user, navigate, bookingFilters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load bookings with current filters
      const bookingsResponse = await bookingsAPI.getAllAdmin(bookingFilters);
      
      // Load properties
      const propertiesResponse = await propertiesAPI.getAll({ limit: 100 });
      
      // Calculate stats
      const stats = calculateStats(bookingsResponse.data.data, propertiesResponse.data.data);
      
      setDashboardData({
        bookings: bookingsResponse.data.data,
        properties: propertiesResponse.data.data,
        stats
      });
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookings, properties) => {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
    const totalProperties = properties.length;
    
    const totalRevenue = bookings
      .filter(b => b.payment && b.payment.isPaid)
      .reduce((sum, b) => sum + (b.payment.advanceAmount || 0), 0);
    
    const totalCommission = bookings
      .filter(b => b.payment && b.payment.isPaid)
      .reduce((sum, b) => sum + (b.payment.adminCommission || 0), 0);

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalProperties,
      totalRevenue,
      totalCommission
    };
  };

  const handleBookingAction = async (bookingId, action, adminNotes = '') => {
    try {
      setActionLoading(true);
      
      const response = await bookingsAPI.adminAction(bookingId, {
        action,
        adminNotes
      });
      
      if (response.data && response.data.success) {
        toast.success(`Booking ${action}ed successfully`);
        setShowBookingModal(false);
        setSelectedBooking(null);
        await loadDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      toast.error(`Failed to ${action} booking`);
    } finally {
      setActionLoading(false);
    }
  };

  const openBookingModal = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#10b981',
      completed: '#06b6d4',
      rejected: '#ef4444',
      cancelled: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0a0a0a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #404040',
            borderTop: '3px solid #f98080',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid #333',
        padding: '2rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ color: '#f3f4f6', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Admin Dashboard
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
                Welcome back, {user?.name}! Manage bookings and properties.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to="/notifications" className="btn-outline" style={{ textDecoration: 'none' }}>
                🔔 Notifications
              </Link>
              <Link to="/" style={{
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}>
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
            <div style={{ color: '#f98080', fontSize: '2rem', fontWeight: 'bold' }}>
              {dashboardData.stats.totalBookings}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Total Bookings</div>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold' }}>
              {dashboardData.stats.pendingBookings}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Pending Review</div>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold' }}>
              {dashboardData.stats.confirmedBookings}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Confirmed</div>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏠</div>
            <div style={{ color: '#8b5cf6', fontSize: '2rem', fontWeight: 'bold' }}>
              {dashboardData.stats.totalProperties}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Properties</div>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ color: '#06b6d4', fontSize: '2rem', fontWeight: 'bold' }}>
              {formatPrice(dashboardData.stats.totalRevenue)}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Total Revenue</div>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💵</div>
            <div style={{ color: '#f98080', fontSize: '2rem', fontWeight: 'bold' }}>
              {formatPrice(dashboardData.stats.totalCommission)}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Admin Commission</div>
          </div>
        </div>

        {/* Bookings Section */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#f3f4f6', fontSize: '1.5rem', fontWeight: '600' }}>
              All Bookings
            </h2>
            
            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select
                value={bookingFilters.status}
                onChange={(e) => setBookingFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                style={{
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  padding: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={bookingFilters.type}
                onChange={(e) => setBookingFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
                style={{
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  padding: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">All Types</option>
                <option value="rent">Rent</option>
                <option value="visit">Visit</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          {dashboardData.bookings.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f0f0f', borderBottom: '1px solid #404040' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#f3f4f6', fontSize: '0.875rem' }}>User</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#f3f4f6', fontSize: '0.875rem' }}>Property</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#f3f4f6', fontSize: '0.875rem' }}>Type</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#f3f4f6', fontSize: '0.875rem' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#f3f4f6', fontSize: '0.875rem' }}>Amount</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: '#f3f4f6', fontSize: '0.875rem' }}>Created</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: '#f3f4f6', fontSize: '0.875rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.bookings.map((booking, index) => (
                    <tr key={booking._id} style={{ 
                      borderBottom: index < dashboardData.bookings.length - 1 ? '1px solid #333' : 'none',
                      '&:hover': { backgroundColor: '#0f0f0f' }
                    }}>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>
                            {booking.user?.name || 'Unknown User'}
                          </div>
                          <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                            {booking.user?.email}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>
                            {booking.property?.title || 'Unknown Property'}
                          </div>
                          <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                            {formatPrice(booking.property?.price || 0)}/month
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          backgroundColor: booking.bookingType === 'rent' ? '#10b981' : '#f59e0b',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize'
                        }}>
                          {booking.bookingType}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          backgroundColor: getStatusColor(booking.status),
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize'
                        }}>
                          {booking.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                          {formatDate(booking.createdAt)}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => openBookingModal(booking)}
                          style={{
                            backgroundColor: '#f98080',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f87171'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#f98080'}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#d1d5db' }}>
                No Bookings Found
              </h3>
              <p>No bookings match your current filters.</p>
            </div>
          )}
        </div>

        {/* Recent Properties */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#f3f4f6', fontSize: '1.5rem', fontWeight: '600' }}>
              Recent Properties
            </h2>
            <Link to="/properties" className="btn-outline" style={{ textDecoration: 'none', fontSize: '0.875rem' }}>
              View All Properties
            </Link>
          </div>

          {dashboardData.properties.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {dashboardData.properties.slice(0, 6).map((property) => (
                <div
                  key={property._id}
                  style={{
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#525252';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#404040';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: '#d1d5db', fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                        {property.title}
                      </h3>
                      <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        📍 {property.location?.address}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#f98080', fontSize: '1.125rem', fontWeight: '600' }}>
                          {formatPrice(property.price)}/month
                        </span>
                        <span style={{
                          backgroundColor: property.type === 'apartment' ? '#10b981' : '#f59e0b',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize'
                        }}>
                          {property.type}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      color: property.availability?.isAvailable ? '#10b981' : '#ef4444',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {property.availability?.isAvailable ? '✅ Available' : '❌ Unavailable'}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
                    <span>👁️ {property.views || 0} views</span>
                    <span>⭐ {property.ratings?.average?.toFixed(1) || '0.0'} ({property.ratings?.count || 0})</span>
                    <span>📅 {formatDate(property.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#d1d5db' }}>
                No Properties Found
              </h3>
              <p>No properties have been added yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#f3f4f6', fontSize: '1.5rem', fontWeight: '600' }}>
                Booking Details
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '1.5rem'
                }}
              >
                ×
              </button>
            </div>

            {/* Booking Information */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Booking ID</div>
                  <div style={{ color: '#d1d5db', fontWeight: '500' }}>{selectedBooking._id}</div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Status</div>
                  <div>
                    <span style={{
                      backgroundColor: getStatusColor(selectedBooking.status),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      textTransform: 'capitalize'
                    }}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Type</div>
                  <div style={{ color: '#d1d5db', fontWeight: '500', textTransform: 'capitalize' }}>
                    {selectedBooking.bookingType}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Created</div>
                  <div style={{ color: '#d1d5db', fontWeight: '500' }}>
                    {formatDate(selectedBooking.createdAt)}
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div style={{
                backgroundColor: '#0f0f0f',
                border: '1px solid #404040',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <h4 style={{ color: '#f3f4f6', fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                  User Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div><strong style={{ color: '#d1d5db' }}>Name:</strong> {selectedBooking.user?.name}</div>
                  <div><strong style={{ color: '#d1d5db' }}>Email:</strong> {selectedBooking.user?.email}</div>
                  <div><strong style={{ color: '#d1d5db' }}>Phone:</strong> {selectedBooking.user?.phone || 'Not provided'}</div>
                </div>
              </div>

              {/* Property Information */}
              <div style={{
                backgroundColor: '#0f0f0f',
                border: '1px solid #404040',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <h4 style={{ color: '#f3f4f6', fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                  Property Information
                </h4>
                <div style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Title:</strong> {selectedBooking.property?.title}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Price:</strong> {formatPrice(selectedBooking.property?.price || 0)}/month
                  </div>
                  <div>
                    <strong>Address:</strong> {selectedBooking.property?.location?.address}
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              {selectedBooking.bookingType === 'visit' ? (
                <div style={{
                  backgroundColor: '#0f0f0f',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#f3f4f6', fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                    Visit Details
                  </h4>
                  <div style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Visit Date:</strong> {formatDate(selectedBooking.visitDate)}
                    </div>
                    <div>
                      <strong>Time Slot:</strong> {selectedBooking.visitTimeSlot}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#0f0f0f',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#f3f4f6', fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                    Rental Details
                  </h4>
                  <div style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Start Date:</strong> {formatDate(selectedBooking.rentalPeriod?.startDate)}
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>End Date:</strong> {formatDate(selectedBooking.rentalPeriod?.endDate)}
                    </div>
                    <div>
                      <strong>Duration:</strong> {selectedBooking.rentalPeriod?.duration} months
                    </div>
                  </div>
                </div>
              )}

              {/* User Message */}
              {selectedBooking.contactInfo?.userMessage && (
                <div style={{
                  backgroundColor: '#0f0f0f',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#f3f4f6', fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                    User Message
                  </h4>
                  <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.5' }}>
                    {selectedBooking.contactInfo.userMessage}
                  </p>
                </div>
              )}

              {/* Payment Information */}
              {selectedBooking.payment && selectedBooking.payment.advanceAmount && (
                <div style={{
                  backgroundColor: '#0f1a0f',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#10b981', fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                    Payment Information
                  </h4>
                  <div style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Advance Amount:</strong> {formatPrice(selectedBooking.payment.advanceAmount)}
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Admin Commission:</strong> {formatPrice(selectedBooking.payment.adminCommission || 0)}
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Owner Amount:</strong> {formatPrice(selectedBooking.payment.ownerAmount || 0)}
                    </div>
                    <div>
                      <strong>Payment Status:</strong>{' '}
                      <span style={{ color: selectedBooking.payment.isPaid ? '#10b981' : '#f59e0b' }}>
                        {selectedBooking.payment.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {selectedBooking.status === 'pending' && (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleBookingAction(selectedBooking._id, 'reject', 'Booking rejected by admin')}
                  disabled={actionLoading}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    opacity: actionLoading ? 0.7 : 1
                  }}
                >
                  {actionLoading ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleBookingAction(selectedBooking._id, 'approve', 'Booking approved by admin')}
                  disabled={actionLoading}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    opacity: actionLoading ? 0.7 : 1
                  }}
                >
                  {actionLoading ? 'Processing...' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

 export default AdminDashboard; 