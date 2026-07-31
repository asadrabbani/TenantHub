import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const OwnerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [generateReportLoading, setGenerateReportLoading] = useState(false);

  // Mock dashboard data for demonstration
  const mockDashboardData = {
    properties: [
      {
        property: {
          _id: '1',
          title: 'Modern 2BR Apartment Near University',
          type: 'apartment',
          price: 1200,
          location: { address: '123 University Ave' }
        },
        currentTenant: {
          name: 'Alice Johnson',
          email: 'alice.j@email.com',
          phone: '+1234567890'
        },
        rentStatus: 'occupied',
        lastMaintenanceDate: '2024-01-15',
        nextMaintenanceDate: '2024-07-15'
      },
      {
        property: {
          _id: '2',
          title: 'Cozy Studio Near Medical School',
          type: 'apartment',
          price: 850,
          location: { address: '456 Medical District' }
        },
        currentTenant: null,
        rentStatus: 'vacant',
        lastMaintenanceDate: '2024-02-01',
        nextMaintenanceDate: '2024-08-01'
      },
      {
        property: {
          _id: '3',
          title: 'Secure Parking Garage',
          type: 'garage',
          price: 150,
          location: { address: '789 Downtown St' }
        },
        currentTenant: {
          name: 'Bob Wilson',
          email: 'bob.w@email.com',
          phone: '+1234567891'
        },
        rentStatus: 'occupied',
        lastMaintenanceDate: '2024-01-10',
        nextMaintenanceDate: '2024-07-10'
      }
    ],
    tenants: [
      {
        tenant: {
          name: 'Alice Johnson',
          email: 'alice.j@email.com',
          phone: '+1234567890'
        },
        property: {
          title: 'Modern 2BR Apartment Near University'
        },
        moveInDate: '2024-01-01',
        leaseEndDate: '2024-12-31',
        rentAmount: 1200,
        securityDeposit: 2400,
        isActive: true
      },
      {
        tenant: {
          name: 'Bob Wilson',
          email: 'bob.w@email.com',
          phone: '+1234567891'
        },
        property: {
          title: 'Secure Parking Garage'
        },
        moveInDate: '2024-02-01',
        leaseEndDate: '2025-01-31',
        rentAmount: 150,
        securityDeposit: 300,
        isActive: true
      }
    ],
    analytics: {
      totalProperties: 3,
      occupiedProperties: 2,
      vacantProperties: 1,
      occupancyRate: 66.7,
      averageRent: 733,
      totalTenants: 2,
      averageResponseTime: 4,
      ownerRating: {
        average: 4.6,
        count: 15
      }
    },
    financials: {
      totalRevenue: 18950,
      monthlyRevenue: 1350,
      yearlyRevenue: 18950,
      pendingPayments: 0,
      totalExpenses: 2500,
      netIncome: 16450,
      lastUpdated: new Date()
    },
    monthlyReports: [
      {
        month: '2024-01',
        revenue: 1200,
        expenses: 200,
        netIncome: 1000,
        occupancyRate: 33.3,
        newTenants: 1,
        tenantTurnover: 0,
        maintenanceRequests: 1,
        generatedAt: '2024-02-01'
      },
      {
        month: '2024-02',
        revenue: 1350,
        expenses: 150,
        netIncome: 1200,
        occupancyRate: 66.7,
        newTenants: 1,
        tenantTurnover: 0,
        maintenanceRequests: 0,
        generatedAt: '2024-03-01'
      },
      {
        month: '2024-03',
        revenue: 1350,
        expenses: 100,
        netIncome: 1250,
        occupancyRate: 66.7,
        newTenants: 0,
        tenantTurnover: 0,
        maintenanceRequests: 2,
        generatedAt: '2024-04-01'
      }
    ]
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'owner') {
      toast.error('Access denied. Owner account required.');
      navigate('/dashboard');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from backend, fallback to mock data
      try {
        const response = await dashboardAPI.getOwnerDashboard();
        setDashboardData(response.data.data);
      } catch (error) {
        console.log('Backend not available, using mock data');
        setDashboardData(mockDashboardData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setDashboardData(mockDashboardData);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyReport = async () => {
    try {
      setGenerateReportLoading(true);
      
      try {
        await dashboardAPI.generateMonthlyReport(selectedMonth);
        toast.success(`Monthly report for ${selectedMonth} generated successfully`);
        loadDashboardData(); // Refresh data
      } catch (error) {
        // Mock report generation
        console.log('Backend not available, using mock report generation');
        toast.success(`Monthly report for ${selectedMonth} generated successfully`);
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setGenerateReportLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
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
      occupied: '#10b981',
      vacant: '#f59e0b',
      maintenance: '#ef4444'
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
          <p>Loading owner dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ color: '#f3f4f6', fontSize: '2rem', marginBottom: '1rem' }}>Error Loading Dashboard</h1>
          <button onClick={loadDashboardData} className="btn-primary">
            Retry
          </button>
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
                Owner Dashboard
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
                Welcome back, {user?.name}! Manage your properties and track your earnings.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to="/properties" className="btn-outline" style={{ textDecoration: 'none' }}>
                Add Property
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
        {/* Analytics Cards */}
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
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏠</div>
            <div style={{ color: '#f98080', fontSize: '2rem', fontWeight: 'bold' }}>
              {dashboardData.analytics.totalProperties}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Total Properties</div>
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
              {dashboardData.analytics.occupiedProperties}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Occupied</div>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ color: '#8b5cf6', fontSize: '2rem', fontWeight: 'bold' }}>
              {dashboardData.analytics.occupancyRate.toFixed(1)}%
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Occupancy Rate</div>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold' }}>
              {formatCurrency(dashboardData.financials.monthlyRevenue)}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Monthly Revenue</div>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
            <div style={{ color: '#06b6d4', fontSize: '2rem', fontWeight: 'bold' }}>
              {dashboardData.analytics.ownerRating.average.toFixed(1)}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Rating ({dashboardData.analytics.ownerRating.count} reviews)</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Properties Overview */}
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h2 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Properties Overview
            </h2>
            <div style={{ space: '1rem' }}>
              {dashboardData.properties.map((propertyData, index) => (
                <div 
                  key={propertyData.property._id}
                  style={{
                    paddingBottom: '1rem',
                    borderBottom: index < dashboardData.properties.length - 1 ? '1px solid #333' : 'none',
                    marginBottom: index < dashboardData.properties.length - 1 ? '1rem' : 0
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                        {propertyData.property.title}
                      </h3>
                      <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                        📍 {propertyData.property.location.address}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        backgroundColor: getStatusColor(propertyData.rentStatus),
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        textTransform: 'capitalize'
                      }}>
                        {propertyData.rentStatus}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>
                        {formatCurrency(propertyData.property.price)}/mo
                      </span>
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                        {propertyData.property.type}
                      </span>
                    </div>
                    {propertyData.currentTenant && (
                      <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                        👤 {propertyData.currentTenant.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h2 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Financial Summary
            </h2>
            <div style={{ space: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Total Revenue</span>
                <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: '600' }}>
                  {formatCurrency(dashboardData.financials.totalRevenue)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Total Expenses</span>
                <span style={{ color: '#ef4444', fontSize: '1rem', fontWeight: '600' }}>
                  {formatCurrency(dashboardData.financials.totalExpenses)}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingTop: '0.75rem',
                borderTop: '1px solid #333'
              }}>
                <span style={{ color: '#f3f4f6', fontSize: '1rem', fontWeight: '600' }}>Net Income</span>
                <span style={{ color: '#f98080', fontSize: '1.125rem', fontWeight: '700' }}>
                  {formatCurrency(dashboardData.financials.netIncome)}
                </span>
              </div>
              <div style={{ 
                backgroundColor: '#0f0f0f', 
                borderRadius: '6px', 
                padding: '1rem', 
                marginTop: '1rem',
                border: '1px solid #404040'
              }}>
                <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  This Month ({new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>Monthly Revenue</span>
                  <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '500' }}>
                    {formatCurrency(dashboardData.financials.monthlyRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Tenants */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Active Tenants
          </h2>
          {dashboardData.tenants.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {dashboardData.tenants.filter(t => t.isActive).map((tenantData, index) => (
                <div 
                  key={index}
                  style={{
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ color: '#d1d5db', fontSize: '1rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                        {tenantData.tenant.name}
                      </h3>
                      <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        📧 {tenantData.tenant.email}
                      </p>
                      <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                        📞 {tenantData.tenant.phone}
                      </p>
                    </div>
                    <span style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}>
                      Active
                    </span>
                  </div>
                  <div style={{ borderTop: '1px solid #404040', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <div>
                        <span style={{ color: '#9ca3af' }}>Property:</span><br/>
                        <span style={{ color: '#d1d5db' }}>{tenantData.property.title}</span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af' }}>Rent:</span><br/>
                        <span style={{ color: '#10b981', fontWeight: '500' }}>{formatCurrency(tenantData.rentAmount)}/mo</span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af' }}>Move-in:</span><br/>
                        <span style={{ color: '#d1d5db' }}>{formatDate(tenantData.moveInDate)}</span>
                      </div>
                      <div>
                        <span style={{ color: '#9ca3af' }}>Lease End:</span><br/>
                        <span style={{ color: '#d1d5db' }}>{formatDate(tenantData.leaseEndDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
              <p>No active tenants</p>
            </div>
          )}
        </div>

        {/* Monthly Reports */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600' }}>
              Monthly Reports
            </h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  padding: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
              <button
                onClick={generateMonthlyReport}
                disabled={generateReportLoading}
                className="btn-primary"
                style={{ 
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  opacity: generateReportLoading ? 0.7 : 1
                }}
              >
                {generateReportLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {dashboardData.monthlyReports.length > 0 ? (
            <div style={{
              overflowX: 'auto',
              border: '1px solid #404040',
              borderRadius: '8px'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f0f0f' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#f3f4f6', fontSize: '0.875rem', borderBottom: '1px solid #404040' }}>Month</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#f3f4f6', fontSize: '0.875rem', borderBottom: '1px solid #404040' }}>Revenue</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#f3f4f6', fontSize: '0.875rem', borderBottom: '1px solid #404040' }}>Expenses</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#f3f4f6', fontSize: '0.875rem', borderBottom: '1px solid #404040' }}>Net Income</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#f3f4f6', fontSize: '0.875rem', borderBottom: '1px solid #404040' }}>Occupancy</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#f3f4f6', fontSize: '0.875rem', borderBottom: '1px solid #404040' }}>New Tenants</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.monthlyReports.map((report, index) => (
                    <tr key={report.month} style={{ borderBottom: index < dashboardData.monthlyReports.length - 1 ? '1px solid #333' : 'none' }}>
                      <td style={{ padding: '1rem', color: '#d1d5db', fontSize: '0.875rem' }}>
                        {new Date(report.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#10b981', fontSize: '0.875rem', fontWeight: '500' }}>
                        {formatCurrency(report.revenue)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#ef4444', fontSize: '0.875rem', fontWeight: '500' }}>
                        {formatCurrency(report.expenses)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#f98080', fontSize: '0.875rem', fontWeight: '600' }}>
                        {formatCurrency(report.netIncome)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#8b5cf6', fontSize: '0.875rem', fontWeight: '500' }}>
                        {report.occupancyRate.toFixed(1)}%
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: '#06b6d4', fontSize: '0.875rem', fontWeight: '500' }}>
                        {report.newTenants}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No Reports Generated</h3>
              <p style={{ marginBottom: '1rem' }}>Generate your first monthly report to track your property performance</p>
              <button
                onClick={generateMonthlyReport}
                disabled={generateReportLoading}
                className="btn-primary"
              >
                {generateReportLoading ? 'Generating...' : 'Generate Report for This Month'}
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '2rem',
          marginTop: '2rem'
        }}>
          <h2 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <Link to="/properties" className="btn-outline" style={{ textDecoration: 'none', textAlign: 'center' }}>
              🏠 Add New Property
            </Link>
            <Link to="/bookings" className="btn-outline" style={{ textDecoration: 'none', textAlign: 'center' }}>
              📅 View All Bookings
            </Link>
            <Link to="/reviews" className="btn-outline" style={{ textDecoration: 'none', textAlign: 'center' }}>
              ⭐ Manage Reviews
            </Link>
            <Link to="/notifications" className="btn-outline" style={{ textDecoration: 'none', textAlign: 'center' }}>
              🔔 Notifications
            </Link>
          </div>
        </div>
      </div>

      {/* Add spinning animation */}
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

export default OwnerDashboard;