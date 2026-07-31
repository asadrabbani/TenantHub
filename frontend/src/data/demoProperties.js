export const demoProperties = [
  {
    _id: 'demo-university-avenue', title: 'Sunlit two-bedroom near University Avenue', type: 'apartment', price: 28000,
    description: 'A quiet, semi-furnished apartment with natural light, a practical study area, and direct public transport to campus.',
    location: { address: 'University Avenue, Dhaka', nearbyPlaces: { campus: { distance: 0.7, duration: '9 min walk' }, mosque: { name: 'Central Mosque', distance: 0.4, duration: '6 min walk' } } },
    images: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1400&q=82&auto=format&fit=crop', alt: 'Bright apartment living room', isPrimary: true }],
    amenities: ['wifi','security','balcony','laundry','kitchen'], specifications: { bedrooms: 2, bathrooms: 1, area: 840, furnished: 'semi' },
    availability: { isAvailable: true, minimumStay: 6 }, ratings: { average: 4.8, count: 18 }, owner: { name: 'Farhan Ahmed', email: 'owner@tenanthub.test', phone: '+880 1700 100002' },
  },
  {
    _id: 'demo-medical-campus', title: 'Furnished studio in the medical district', type: 'apartment', price: 19500,
    description: 'A compact, fully furnished studio designed for focused study, with building security and reliable internet.',
    location: { address: 'Medical College Road, Dhaka', nearbyPlaces: { campus: { distance: 0.4, duration: '5 min walk' }, mosque: { name: 'Medical College Mosque', distance: 0.6, duration: '8 min walk' } } },
    images: [{ url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&q=82&auto=format&fit=crop', alt: 'Furnished studio apartment', isPrimary: true }],
    amenities: ['wifi','furnished','air_conditioning','security'], specifications: { bedrooms: 1, bathrooms: 1, area: 470, furnished: 'fully' },
    availability: { isAvailable: true, minimumStay: 12 }, ratings: { average: 4.6, count: 11 }, owner: { name: 'Farhan Ahmed' },
  },
  {
    _id: 'demo-dhanmondi', title: 'Three-bedroom home for a shared lease', type: 'apartment', price: 46000,
    description: 'A spacious apartment for classmates or colleagues, with three bedrooms, two bathrooms, and on-site parking.',
    location: { address: 'Dhanmondi 9/A, Dhaka', nearbyPlaces: { campus: { distance: 2.1, duration: '14 min by bus' } } },
    images: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=82&auto=format&fit=crop', alt: 'Modern three-bedroom apartment', isPrimary: true }],
    amenities: ['wifi','parking','elevator','security','balcony'], specifications: { bedrooms: 3, bathrooms: 2, area: 1280, furnished: 'semi' },
    availability: { isAvailable: true, minimumStay: 12 }, ratings: { average: 4.9, count: 26 }, owner: { name: 'Farhan Ahmed' },
  },
  {
    _id: 'demo-mohakhali', title: 'One-bedroom flat beside the bus corridor', type: 'apartment', price: 22500,
    description: 'An efficient one-bedroom rental with a short walk to major bus routes and everyday services.',
    location: { address: 'Mohakhali DOHS, Dhaka', nearbyPlaces: { campus: { distance: 1.8, duration: '12 min by bus' } } },
    images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1400&q=82&auto=format&fit=crop', alt: 'Comfortable one-bedroom apartment', isPrimary: true }],
    amenities: ['wifi','security','heating'], specifications: { bedrooms: 1, bathrooms: 1, area: 610, furnished: 'unfurnished' },
    availability: { isAvailable: true, minimumStay: 6 }, ratings: { average: 4.3, count: 9 }, owner: { name: 'Farhan Ahmed' },
  },
  {
    _id: 'demo-parking-central', title: 'Covered parking near Central Campus', type: 'garage', price: 6500,
    description: 'A reserved covered space with round-the-clock building security and straightforward monthly access.',
    location: { address: 'Central Campus Gate, Dhaka', nearbyPlaces: { campus: { distance: 0.2, duration: '3 min walk' } } },
    images: [{ url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1400&q=82&auto=format&fit=crop', alt: 'Covered parking garage', isPrimary: true }],
    amenities: ['security','covered'], specifications: { bedrooms: 0, bathrooms: 0, area: 190, furnished: 'unfurnished' },
    availability: { isAvailable: true, minimumStay: 1 }, ratings: { average: 4.5, count: 8 }, owner: { name: 'Farhan Ahmed' },
  },
  {
    _id: 'demo-parking-banani', title: 'Secure basement parking in Banani', type: 'garage', price: 8000,
    description: 'A monitored basement parking space with controlled entry, suitable for a long-term monthly booking.',
    location: { address: 'Banani 11, Dhaka', nearbyPlaces: { campus: { distance: 3.2, duration: '18 min by car' } } },
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=82&auto=format&fit=crop', alt: 'Underground parking garage', isPrimary: true }],
    amenities: ['security','covered'], specifications: { bedrooms: 0, bathrooms: 0, area: 180, furnished: 'unfurnished' },
    availability: { isAvailable: false, minimumStay: 3 }, ratings: { average: 4.4, count: 13 }, owner: { name: 'Farhan Ahmed' },
  },
];

export const findDemoProperty = id => demoProperties.find(property => property._id === id);
