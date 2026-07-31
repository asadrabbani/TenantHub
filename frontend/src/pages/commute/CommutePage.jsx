import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { commuteAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const CommutePage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [nearbyMosques, setNearbyMosques] = useState([]);
  const [searchParams, setSearchParams] = useState({
    destinationAddress: '',
    destinationLat: '',
    destinationLng: '',
    maxCommuteTime: 30,
    commuteMode: 'driving'
  });
  const [showDistanceCalculator, setShowDistanceCalculator] = useState(false);
  const [distanceCalc, setDistanceCalc] = useState({
    from: '',
    to: '',
    result: null,
    calculating: false
  });

  // Enhanced mock properties with detailed commute data
  const mockPropertiesWithCommute = [
    {
      _id: '1',
      title: 'Modern 2BR Apartment Near University',
      price: 1200,
      type: 'apartment',
      location: {
        address: '123 University Ave, Campus Town',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      availability: { isAvailable: true },
      ratings: { average: 4.5, count: 12 },
      views: 89,
      commuteInfo: {
        distance: 2.5,
        duration: 15,
        mode: 'driving',
        estimatedCost: 5,
        carbonFootprint: 1.2, // kg CO2
        routes: [
          {
            mode: 'driving',
            duration: 15,
            distance: 2.5,
            cost: 5,
            carbonFootprint: 1.2,
            description: 'Via University Ave - Direct route with moderate traffic',
            steps: ['Head east on University Ave', 'Turn left on Main St', 'Arrive at destination']
          },
          {
            mode: 'walking',
            duration: 35,
            distance: 2.5,
            cost: 0,
            carbonFootprint: 0,
            description: 'Direct walk via campus - Safe pedestrian route',
            steps: ['Walk east through campus quad', 'Cross at University Bridge', 'Continue straight to destination']
          },
          {
            mode: 'transit',
            duration: 25,
            distance: 2.8,
            cost: 3,
            carbonFootprint: 0.3,
            description: 'Bus route 45 + short walk - Eco-friendly option',
            steps: ['Walk to Bus Stop A (2 min)', 'Take Bus #45 (18 min)', 'Walk to destination (5 min)']
          },
          {
            mode: 'bicycling',
            duration: 12,
            distance: 2.5,
            cost: 0,
            carbonFootprint: 0,
            description: 'Bike lane route - Fastest and healthiest option',
            steps: ['Take bike lane on University Ave', 'Use dedicated cycling bridge', 'Bike parking available']
          }
        ]
      },
      nearbyMosques: [
        {
          name: 'Campus Mosque',
          distance: 300,
          walkingTime: '3 minutes walk',
          prayerTimes: {
            fajr: '05:30',
            dhuhr: '12:45',
            asr: '15:30',
            maghrib: '18:15',
            isha: '19:45'
          }
        }
      ],
      studySpaces: [
        { name: 'University Library', distance: 400, type: 'library' },
        { name: 'Study Hub Cafe', distance: 200, type: 'cafe' },
        { name: '24/7 Study Center', distance: 600, type: 'study_hall' }
      ],
      groceryStores: [
        { name: 'Campus Market', distance: 150, type: 'convenience' },
        { name: 'Fresh Foods Supermarket', distance: 800, type: 'supermarket' }
      ]
    },
    {
      _id: '2',
      title: 'Cozy Studio Near Medical School',
      price: 850,
      type: 'apartment',
      location: {
        address: '456 Medical District, Health Campus',
        coordinates: { lat: 40.7589, lng: -73.9851 }
      },
      availability: { isAvailable: true },
      ratings: { average: 4.2, count: 8 },
      views: 67,
      commuteInfo: {
        distance: 4.2,
        duration: 25,
        mode: 'driving',
        estimatedCost: 8,
        carbonFootprint: 2.1,
        routes: [
          {
            mode: 'driving',
            duration: 25,
            distance: 4.2,
            cost: 8,
            carbonFootprint: 2.1,
            description: 'Via Main St and Medical Blvd - Hospital route',
            steps: ['Take Main St south', 'Turn right on Medical Blvd', 'Enter via Medical Center entrance']
          },
          {
            mode: 'walking',
            duration: 55,
            distance: 4.2,
            cost: 0,
            carbonFootprint: 0,
            description: 'Walking route via parks - Scenic but longer',
            steps: ['Walk through Central Park', 'Cross Medical Bridge', 'Use hospital walkways']
          },
          {
            mode: 'transit',
            duration: 35,
            distance: 4.8,
            cost: 4,
            carbonFootprint: 0.5,
            description: 'Metro Red Line + Bus 32 - Reliable public transport',
            steps: ['Metro Red Line (15 min)', 'Transfer to Bus #32 (12 min)', 'Walk to Medical School (8 min)']
          },
          {
            mode: 'bicycling',
            duration: 20,
            distance: 4.0,
            cost: 0,
            carbonFootprint: 0,
            description: 'Bike route via Medical District bike lanes',
            steps: ['Protected bike lane on Medical Ave', 'Cross at Medical Bridge', 'Secure bike parking at hospital']
          }
        ]
      },
      nearbyMosques: [
        {
          name: 'Medical District Mosque',
          distance: 800,
          walkingTime: '10 minutes walk',
          prayerTimes: {
            fajr: '05:30',
            dhuhr: '12:45',
            asr: '15:30',
            maghrib: '18:15',
            isha: '19:45'
          }
        }
      ],
      studySpaces: [
        { name: 'Medical Library', distance: 300, type: 'library' },
        { name: 'Hospital Study Lounge', distance: 100, type: 'lounge' }
      ],
      groceryStores: [
        { name: 'Medical Plaza Market', distance: 500, type: 'convenience' },
        { name: 'Health Foods Store', distance: 1200, type: 'organic' }
      ]
    },
    {
      _id: '3',
      title: 'Budget 1BR Near Business School',
      price: 950,
      type: 'apartment',
      location: {
        address: '321 Business Ave, Commerce District',
        coordinates: { lat: 40.7282, lng: -74.0776 }
      },
      availability: { isAvailable: true },
      ratings: { average: 4.0, count: 15 },
      views: 78,
      commuteInfo: {
        distance: 1.8,
        duration: 12,
        mode: 'driving',
        estimatedCost: 4,
        carbonFootprint: 0.9,
        routes: [
          {
            mode: 'driving',
            duration: 12,
            distance: 1.8,
            cost: 4,
            carbonFootprint: 0.9,
            description: 'Direct route via Business Blvd',
            steps: ['Business Blvd straight', 'Turn into campus parking', 'Short walk to building']
          },
          {
            mode: 'walking',
            duration: 22,
            distance: 1.8,
            cost: 0,
            carbonFootprint: 0,
            description: 'Pleasant walk through business district',
            steps: ['Walk via Business Plaza', 'Cross at main intersection', 'Enter through main campus gate']
          },
          {
            mode: 'bicycling',
            duration: 8,
            distance: 1.8,
            cost: 0,
            carbonFootprint: 0,
            description: 'Quick bike ride - bike sharing available',
            steps: ['Bike sharing station nearby', 'Business Ave bike lane', 'Drop off at campus bike share']
          }
        ]
      },
      nearbyMosques: [
        {
          name: 'Business District Mosque',
          distance: 400,
          walkingTime: '5 minutes walk'
        }
      ],
      studySpaces: [
        { name: 'Business Library', distance: 200, type: 'library' },
        { name: 'Entrepreneur Hub', distance: 150, type: 'coworking' }
      ],
      groceryStores: [
        { name: 'Quick Stop Market', distance: 100, type: 'convenience' }
      ]
    }
  ];

  // Common student destinations
  const commonDestinations = [
    { name: 'University Campus - Main Building', address: 'University Campus, Main Building', lat: 40.7505, lng: -73.9934 },
    { name: 'Medical School', address: 'Medical School, Health Campus', lat: 40.7589, lng: -73.9851 },
    { name: 'Business School', address: 'Business School, Commerce District', lat: 40.7282, lng: -74.0776 },
    { name: 'Engineering Campus', address: 'Engineering Campus, Tech District', lat: 40.7128, lng: -74.0060 },
    { name: 'Law School', address: 'Law School, Legal District', lat: 40.7831, lng: -73.9712 },
    { name: 'Downtown Office District', address: 'Downtown Office District', lat: 40.7505, lng: -73.9934 }
  ];

  useEffect(() => {
    // Set default destination
    setSearchParams(prev => ({
      ...prev,
      destinationAddress: 'University Campus - Main Building',
      destinationLat: 40.7505,
      destinationLng: -73.9934
    }));
    
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setProperties(mockPropertiesWithCommute);
      await loadNearbyMosques(40.7505, -73.9934);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setProperties(mockPropertiesWithCommute);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyMosques = async (lat, lng) => {
    try {
      const mockMosques = [
        {
          name: "Central Mosque",
          address: "123 Main Street, Campus Area",
          distance: 800,
          walkingTime: "10 minutes",
          coordinates: { lat: lat + 0.005, lng: lng + 0.005 },
          prayerTimes: {
            fajr: "05:30", dhuhr: "12:45", asr: "15:30", maghrib: "18:15", isha: "19:45"
          },
          facilities: ["parking", "ablution_area", "separate_women_section"]
        },
        {
          name: "University Mosque",
          address: "456 University Avenue",
          distance: 1200,
          walkingTime: "15 minutes",
          coordinates: { lat: lat - 0.008, lng: lng + 0.003 },
          prayerTimes: {
            fajr: "05:30", dhuhr: "12:45", asr: "15:30", maghrib: "18:15", isha: "19:45"
          },
          facilities: ["wheelchair_accessible", "ablution_area"]
        }
      ];
      setNearbyMosques(mockMosques);
    } catch (error) {
      console.error('Error loading nearby mosques:', error);
    }
  };

  const handleDestinationChange = async (destination) => {
    const selected = commonDestinations.find(d => d.name === destination);
    if (selected) {
      setSearchParams(prev => ({
        ...prev,
        destinationAddress: selected.name,
        destinationLat: selected.lat,
        destinationLng: selected.lng
      }));
      await loadNearbyMosques(selected.lat, selected.lng);
    }
  };

  const searchPropertiesWithCommute = async () => {
    if (!searchParams.destinationAddress) {
      toast.error('Please select a destination');
      return;
    }

    try {
      setSearchLoading(true);
      
      const filteredProperties = mockPropertiesWithCommute.filter(property => 
        property.commuteInfo.routes.some(route => 
          route.mode === searchParams.commuteMode && route.duration <= searchParams.maxCommuteTime
        )
      );
      
      setProperties(filteredProperties);
      
      if (filteredProperties.length === 0) {
        toast.info(`No properties found within ${searchParams.maxCommuteTime} minutes by ${searchParams.commuteMode}`);
      } else {
        toast.success(`Found ${filteredProperties.length} properties within your commute range`);
      }
      
    } catch (error) {
      toast.error('Error searching properties');
    } finally {
      setSearchLoading(false);
    }
  };

  const calculateDistance = async () => {
    if (!distanceCalc.from || !distanceCalc.to) {
      toast.error('Please enter both locations');
      return;
    }

    setDistanceCalc(prev => ({ ...prev, calculating: true }));
    
    // Simulate distance calculation
    setTimeout(() => {
      const mockResult = {
        distance: (Math.random() * 10 + 1).toFixed(1),
        drivingTime: Math.floor(Math.random() * 30 + 5),
        walkingTime: Math.floor(Math.random() * 60 + 15),
        transitTime: Math.floor(Math.random() * 45 + 10),
        bikingTime: Math.floor(Math.random() * 25 + 8),
        estimatedCosts: {
          driving: Math.floor(Math.random() * 10 + 2),
          transit: Math.floor(Math.random() * 5 + 2),
          rideshare: Math.floor(Math.random() * 15 + 8)
        },
        carbonFootprint: {
          driving: (Math.random() * 3 + 0.5).toFixed(1),
          transit: (Math.random() * 0.8 + 0.1).toFixed(1),
          walking: 0,
          biking: 0
        }
      };
      
      setDistanceCalc(prev => ({ 
        ...prev, 
        result: mockResult, 
        calculating: false 
      }));
      
      toast.success('Distance calculated successfully!');
    }, 2000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCommuteColor = (duration) => {
    if (duration <= 15) return '#10b981';
    if (duration <= 30) return '#f59e0b';
    return '#ef4444';
  };

  const getModeIcon = (mode) => {
    const icons = {
      driving: '🚗',
      walking: '🚶',
      transit: '🚌',
      bicycling: '🚴'
    };
    return icons[mode] || '🚗';
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
          <p>Loading commute data...</p>
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
                🚗 Smart Commute Finder
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
                Find the perfect student housing with optimal commute times and nearby amenities
              </p>
            </div>
            <Link to="/" style={{
              color: '#9ca3af',
              textDecoration: 'none',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Interactive Tools Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          
          {/* Property Search by Commute */}
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '2rem'
          }}>
            <h2 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              🎯 Find Properties by Commute
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Select Your Campus/Workplace
              </label>
              <select
                value={searchParams.destinationAddress}
                onChange={(e) => handleDestinationChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#2d2d2d',
                  border: '1px solid #404040',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  fontSize: '1rem'
                }}
              >
                {commonDestinations.map((dest, index) => (
                  <option key={index} value={dest.name}>{dest.name}</option>
                ))}
              </select>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Max Commute Time
                </label>
                <select
                  value={searchParams.maxCommuteTime}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, maxCommuteTime: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #404040',
                    borderRadius: '6px',
                    color: '#f3f4f6',
                    fontSize: '1rem'
                  }}
                >
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Transportation Mode
                </label>
                <select
                  value={searchParams.commuteMode}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, commuteMode: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #404040',
                    borderRadius: '6px',
                    color: '#f3f4f6',
                    fontSize: '1rem'
                  }}
                >
                  <option value="driving">🚗 Driving</option>
                  <option value="walking">🚶 Walking</option>
                  <option value="transit">🚌 Public Transit</option>
                  <option value="bicycling">🚴 Bicycling</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={searchPropertiesWithCommute}
              disabled={searchLoading}
              className="btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {searchLoading ? (
                <>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Searching...
                </>
              ) : (
                <>🔍 Find Properties</>
              )}
            </button>
          </div>

          {/* Distance Calculator */}
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#f3f4f6', fontSize: '1.25rem', fontWeight: '600' }}>
                📐 Distance Calculator
              </h2>
              <button
                onClick={() => setShowDistanceCalculator(!showDistanceCalculator)}
                style={{
                  backgroundColor: showDistanceCalculator ? '#f98080' : '#2d2d2d',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                {showDistanceCalculator ? 'Hide' : 'Show'} Calculator
              </button>
            </div>

            {showDistanceCalculator && (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    From (Address)
                  </label>
                  <input
                    type="text"
                    value={distanceCalc.from}
                    onChange={(e) => setDistanceCalc(prev => ({ ...prev, from: e.target.value }))}
                    placeholder="Enter starting address"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#2d2d2d',
                      border: '1px solid #404040',
                      borderRadius: '6px',
                      color: '#f3f4f6',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    To (Address)
                  </label>
                  <input
                    type="text"
                    value={distanceCalc.to}
                    onChange={(e) => setDistanceCalc(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="Enter destination address"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#2d2d2d',
                      border: '1px solid #404040',
                      borderRadius: '6px',
                      color: '#f3f4f6',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <button
                  onClick={calculateDistance}
                  disabled={distanceCalc.calculating}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {distanceCalc.calculating ? (
                    <>
                      <div style={{
                        width: '1rem',
                        height: '1rem',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Calculating...
                    </>
                  ) : (
                    <>📏 Calculate Distance & Time</>
                  )}
                </button>

                {/* Distance Results */}
                {distanceCalc.result && (
                  <div style={{
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <div style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                      📊 Distance & Time Results
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', color: '#d1d5db' }}>
                      <div><strong>Distance:</strong> {distanceCalc.result.distance} km</div>
                      <div><strong>🚗 Driving:</strong> {distanceCalc.result.drivingTime} min</div>
                      <div><strong>🚶 Walking:</strong> {distanceCalc.result.walkingTime} min</div>
                      <div><strong>🚌 Transit:</strong> {distanceCalc.result.transitTime} min</div>
                      <div><strong>🚴 Biking:</strong> {distanceCalc.result.bikingTime} min</div>
                      <div><strong>💰 Drive Cost:</strong> ${distanceCalc.result.estimatedCosts.driving}</div>
                    </div>
                    <div style={{ 
                      marginTop: '0.75rem', 
                      paddingTop: '0.75rem', 
                      borderTop: '1px solid #404040',
                      fontSize: '0.75rem',
                      color: '#9ca3af'
                    }}>
                      <div><strong>🌱 Carbon Footprint:</strong></div>
                      <div>Driving: {distanceCalc.result.carbonFootprint.driving} kg CO₂ | Transit: {distanceCalc.result.carbonFootprint.transit} kg CO₂</div>
                      <div>Walking/Biking: 0 kg CO₂ 🌿</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!showDistanceCalculator && (
              <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📐</div>
                <p style={{ fontSize: '0.875rem' }}>
                  Calculate distance and time between any two locations
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem'
        }}>
          
          {/* Properties List */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem' 
            }}>
              <h2 style={{ color: '#f3f4f6', fontSize: '1.5rem', fontWeight: '600' }}>
                🏠 Properties with Detailed Commute Info
              </h2>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                {properties.length} properties found
              </div>
            </div>

            {properties.length > 0 ? (
              <div style={{ space: '2rem' }}>
                {properties.map((property) => (
                  <div
                    key={property._id}
                    style={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '12px',
                      padding: '2rem',
                      marginBottom: '2rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#404040';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#333';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Property Header */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'start', 
                      marginBottom: '1.5rem' 
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem', 
                          marginBottom: '0.5rem' 
                        }}>
                          <h3 style={{ 
                            color: '#f3f4f6', 
                            fontSize: '1.25rem', 
                            fontWeight: '600', 
                            margin: 0 
                          }}>
                            {property.title}
                          </h3>
                          <span style={{
                            backgroundColor: property.type === 'apartment' ? '#10b981' : '#f59e0b',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            textTransform: 'capitalize'
                          }}>
                            {property.type}
                          </span>
                        </div>
                        <p style={{ 
                          color: '#9ca3af', 
                          fontSize: '0.875rem', 
                          marginBottom: '0.75rem' 
                        }}>
                          📍 {property.location.address}
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '2rem', 
                          flexWrap: 'wrap' 
                        }}>
                          <span style={{ 
                            color: '#f98080', 
                            fontSize: '1.25rem', 
                            fontWeight: '700' 
                          }}>
                            {formatPrice(property.price)}/month
                          </span>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem' 
                          }}>
                            <span style={{ color: '#f59e0b' }}>⭐</span>
                            <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                              {property.ratings.average} ({property.ratings.count})
                            </span>
                          </div>
                          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                            👁️ {property.views} views
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Commute Options Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      {property.commuteInfo.routes.map((route, index) => (
                        <div
                          key={index}
                          style={{
                            backgroundColor: '#0f0f0f',
                            border: `2px solid ${route.mode === searchParams.commuteMode ? '#f98080' : '#404040'}`,
                            borderRadius: '8px',
                            padding: '1rem',
                            textAlign: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ 
                            fontSize: '1.5rem', 
                            marginBottom: '0.5rem' 
                          }}>
                            {getModeIcon(route.mode)}
                          </div>
                          <div style={{ 
                            color: getCommuteColor(route.duration), 
                            fontSize: '1.125rem', 
                            fontWeight: 'bold', 
                            marginBottom: '0.25rem' 
                          }}>
                            {route.duration} min
                          </div>
                          <div style={{ 
                            color: '#9ca3af', 
                            fontSize: '0.75rem', 
                            marginBottom: '0.5rem' 
                          }}>
                            {route.distance} km • ${route.cost}
                          </div>
                          <div style={{ 
                            color: '#10b981', 
                            fontSize: '0.75rem',
                            marginBottom: '0.25rem'
                          }}>
                            🌱 {route.carbonFootprint} kg CO₂
                          </div>
                          <div style={{ 
                            color: '#d1d5db', 
                            fontSize: '0.75rem',
                            lineHeight: '1.3'
                          }}>
                            {route.description}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Detailed Route Steps */}
                    <div style={{
                      backgroundColor: '#0a0a0a',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <h4 style={{ 
                        color: '#d1d5db', 
                        fontSize: '1rem', 
                        fontWeight: '500', 
                        marginBottom: '0.75rem' 
                      }}>
                        🗺️ Detailed Route ({searchParams.commuteMode}):
                      </h4>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        {property.commuteInfo.routes
                          .find(route => route.mode === searchParams.commuteMode)
                          ?.steps.map((step, index) => (
                          <div 
                            key={index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              color: '#9ca3af',
                              fontSize: '0.875rem'
                            }}
                          >
                            <div style={{
                              backgroundColor: '#f98080',
                              color: 'white',
                              borderRadius: '50%',
                              width: '1.5rem',
                              height: '1.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              {index + 1}
                            </div>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Student Amenities */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      
                      {/* Study Spaces */}
                      {property.studySpaces && (
                        <div style={{
                          backgroundColor: '#0f1a0f',
                          border: '1px solid #10b981',
                          borderRadius: '6px',
                          padding: '1rem'
                        }}>
                          <div style={{ 
                            color: '#10b981', 
                            fontSize: '0.875rem', 
                            fontWeight: '500', 
                            marginBottom: '0.5rem' 
                          }}>
                            📚 Nearby Study Spaces:
                          </div>
                          {property.studySpaces.map((space, index) => (
                            <div key={index} style={{ 
                              color: '#9ca3af', 
                              fontSize: '0.75rem',
                              marginBottom: '0.25rem'
                            }}>
                              {space.name} ({space.distance}m) - {space.type}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Grocery Stores */}
                      {property.groceryStores && (
                        <div style={{
                          backgroundColor: '#1a0f0f',
                          border: '1px solid #f59e0b',
                          borderRadius: '6px',
                          padding: '1rem'
                        }}>
                          <div style={{ 
                            color: '#f59e0b', 
                            fontSize: '0.875rem', 
                            fontWeight: '500', 
                            marginBottom: '0.5rem' 
                          }}>
                            🛒 Grocery Stores:
                          </div>
                          {property.groceryStores.map((store, index) => (
                            <div key={index} style={{ 
                              color: '#9ca3af', 
                              fontSize: '0.75rem',
                              marginBottom: '0.25rem'
                            }}>
                              {store.name} ({store.distance}m) - {store.type}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Nearby Mosques */}
                      {property.nearbyMosques && (
                        <div style={{
                          backgroundColor: '#0f0f1a',
                          border: '1px solid #8b5cf6',
                          borderRadius: '6px',
                          padding: '1rem'
                        }}>
                          <div style={{ 
                            color: '#8b5cf6', 
                            fontSize: '0.875rem', 
                            fontWeight: '500', 
                            marginBottom: '0.5rem' 
                          }}>
                            🕌 Nearby Mosques:
                          </div>
                          {property.nearbyMosques.map((mosque, index) => (
                            <div key={index} style={{ 
                              color: '#9ca3af', 
                              fontSize: '0.75rem',
                              marginBottom: '0.25rem'
                            }}>
                              {mosque.name} ({mosque.distance}m) - {mosque.walkingTime}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid #333'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        <Link 
                          to={`/properties/${property._id}`}
                          className="btn-outline"
                          style={{ textDecoration: 'none' }}
                        >
                          📋 View Details
                        </Link>
                        <Link 
                          to={`/booking/${property._id}`}
                          className="btn-primary"
                          style={{ textDecoration: 'none' }}
                        >
                          📅 Book Now
                        </Link>
                      </div>
                      
                      {/* Environmental Impact */}
                      <div style={{
                        textAlign: 'right',
                        color: '#10b981',
                        fontSize: '0.75rem'
                      }}>
                        <div>🌱 Eco Score</div>
                        <div style={{ fontWeight: 'bold' }}>
                          {property.commuteInfo.carbonFootprint < 1 ? 'Excellent' : 
                           property.commuteInfo.carbonFootprint < 2 ? 'Good' : 'Moderate'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#9ca3af',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  marginBottom: '0.5rem', 
                  color: '#d1d5db' 
                }}>
                  No Properties Found
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  No properties found within {searchParams.maxCommuteTime} minutes by {searchParams.commuteMode}.
                </p>
                <p style={{ fontSize: '0.875rem', marginBottom: '2rem' }}>
                  Try increasing the commute time or changing the transportation mode.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => setSearchParams(prev => ({ ...prev, maxCommuteTime: 60 }))}
                    className="btn-outline"
                  >
                    Try 60 minutes
                  </button>
                  <Link to="/properties" className="btn-primary" style={{ textDecoration: 'none' }}>
                    View All Properties
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div>
            
            {/* Student Quick Tips */}
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                color: '#f3f4f6', 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '1rem' 
              }}>
                🎓 Student Commute Tips
              </h3>
              <div style={{ space: '0.75rem' }}>
                <div style={{
                  backgroundColor: '#0f1a0f',
                  border: '1px solid #10b981',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '500' }}>
                    💡 Morning Classes
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                    Add 15-20 minutes to commute times for 8-9 AM classes due to rush hour
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#1a1a0f',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ color: '#f59e0b', fontSize: '0.875rem', fontWeight: '500' }}>
                    🚴 Budget-Friendly
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                    Biking saves $100-300/month and keeps you fit!
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#0f0f1a',
                  border: '1px solid #8b5cf6',
                  borderRadius: '6px',
                  padding: '0.75rem'
                }}>
                  <div style={{ color: '#8b5cf6', fontSize: '0.875rem', fontWeight: '500' }}>
                    🚌 Student Discounts
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                    Many transit systems offer 50% student discounts
                  </div>
                </div>
              </div>
            </div>

            {/* Nearby Mosques */}
            {nearbyMosques.length > 0 && (
              <div style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ 
                  color: '#f3f4f6', 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  marginBottom: '1rem' 
                }}>
                  🕌 Nearby Mosques
                </h3>
                <div style={{ space: '1rem' }}>
                  {nearbyMosques.map((mosque, index) => (
                    <div
                      key={index}
                      style={{
                        paddingBottom: '1rem',
                        borderBottom: index < nearbyMosques.length - 1 ? '1px solid #333' : 'none',
                        marginBottom: index < nearbyMosques.length - 1 ? '1rem' : 0
                      }}
                    >
                      <h4 style={{ 
                        color: '#d1d5db', 
                        fontSize: '1rem', 
                        fontWeight: '500', 
                        marginBottom: '0.5rem' 
                      }}>
                        {mosque.name}
                      </h4>
                      <p style={{ 
                        color: '#9ca3af', 
                        fontSize: '0.875rem', 
                        marginBottom: '0.5rem' 
                      }}>
                        📍 {mosque.address}
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '0.75rem' 
                      }}>
                        <span style={{ 
                          color: '#10b981', 
                          fontSize: '0.875rem', 
                          fontWeight: '500' 
                        }}>
                          {mosque.distance}m away
                        </span>
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                          🚶 {mosque.walkingTime}
                        </span>
                      </div>
                      
                      {mosque.prayerTimes && (
                        <div style={{ 
                          backgroundColor: '#0f0f0f', 
                          border: '1px solid #404040', 
                          borderRadius: '6px', 
                          padding: '0.75rem',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{ 
                            color: '#d1d5db', 
                            fontSize: '0.75rem', 
                            fontWeight: '500', 
                            marginBottom: '0.5rem' 
                          }}>
                            Prayer Times:
                          </div>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '0.25rem', 
                            fontSize: '0.75rem', 
                            color: '#9ca3af' 
                          }}>
                            <span>Fajr: {mosque.prayerTimes.fajr}</span>
                            <span>Dhuhr: {mosque.prayerTimes.dhuhr}</span>
                            <span>Asr: {mosque.prayerTimes.asr}</span>
                            <span>Maghrib: {mosque.prayerTimes.maghrib}</span>
                            <span>Isha: {mosque.prayerTimes.isha}</span>
                          </div>
                        </div>
                      )}
                      
                      {mosque.facilities && mosque.facilities.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {mosque.facilities.map((facility, facilityIndex) => (
                            <span
                              key={facilityIndex}
                              style={{
                                backgroundColor: '#0a1a0a',
                                border: '1px solid #10b981',
                                color: '#10b981',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.625rem'
                              }}
                            >
                              {facility.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Environmental Impact */}
            <div style={{
              backgroundColor: '#0f1a0f',
              border: '1px solid #10b981',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <h3 style={{ 
                color: '#10b981', 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '1rem' 
              }}>
                🌱 Environmental Impact
              </h3>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#10b981' }}>🚴 Biking/Walking:</strong> Zero emissions, best for environment and health
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#f59e0b' }}>🚌 Public Transit:</strong> 80% less CO₂ than driving alone
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#ef4444' }}>🚗 Driving:</strong> Highest emissions, but most convenient
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '1rem' }}>
                  💡 Choose eco-friendly commutes to reduce your carbon footprint!
                </div>
              </div>
            </div>
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

export default CommutePage;