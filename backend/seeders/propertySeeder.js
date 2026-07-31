const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (mongoose.connection.readyState === 0) await mongoose.connect(uri);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Sample properties data
const sampleProperties = [
    {
        title: 'Modern 2BR Apartment Near University',
        description: 'Beautiful modern apartment perfect for students. This spacious 2-bedroom, 1-bathroom unit features contemporary finishes, in-unit laundry, and a private balcony. Located just minutes from campus with easy access to public transportation.',
        type: 'apartment',
        price: 1200,
        location: {
            address: '123 University Ave, Campus Town',
            coordinates: { lat: 40.7128, lng: -74.0060 },
            nearbyPlaces: {
                campus: { distance: 500, duration: '5 minutes walk' },
                mosque: { name: 'Campus Mosque', distance: 300, duration: '3 minutes walk' }
            }
        },
        images: [
            { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', alt: 'Living room', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', alt: 'Bedroom', isPrimary: false },
            { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', alt: 'Kitchen', isPrimary: false }
        ],
        amenities: ['wifi', 'parking', 'laundry', 'security', 'balcony', 'air_conditioning'],
        specifications: {
            bedrooms: 2,
            bathrooms: 1,
            area: 800,
            floor: 2,
            totalFloors: 4,
            furnished: 'semi'
        },
        availability: {
            isAvailable: true,
            availableFrom: '2024-09-01',
            minimumStay: 6
        },
        ratings: { average: 4.5, count: 12 },
        reviews: [
            {
                rating: 5,
                comment: 'Excellent apartment! Great location and very clean. The owner is responsive and helpful.',
                createdAt: '2024-01-15'
            }
        ],
        views: 89
    },
    {
        title: 'Cozy Studio Near Medical School',
        description: 'Perfect for medical students. Quiet neighborhood, fully furnished, high-speed internet. Walking distance to medical campus and hospital.',
        type: 'apartment',
        price: 850,
        location: {
            address: '456 Medical District, Health Campus',
            coordinates: { lat: 40.7589, lng: -73.9851 },
            nearbyPlaces: {
                campus: { distance: 300, duration: '3 minutes walk' },
                mosque: { name: 'Medical District Mosque', distance: 800, duration: '10 minutes walk' }
            }
        },
        images: [
            { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', alt: 'Studio apartment', isPrimary: true }
        ],
        amenities: ['wifi', 'furnished', 'air_conditioning', 'security'],
        specifications: {
            bedrooms: 0,
            bathrooms: 1,
            area: 450,
            floor: 3,
            totalFloors: 5,
            furnished: 'fully'
        },
        availability: {
            isAvailable: true,
            availableFrom: '2024-08-15',
            minimumStay: 12
        },
        ratings: { average: 4.2, count: 8 },
        views: 67
    },
    {
        title: 'Luxury 3BR Apartment with Gym',
        description: 'Premium apartment with full amenities including gym, pool, and concierge service. Perfect for graduate students or professionals.',
        type: 'apartment',
        price: 2500,
        location: {
            address: '789 Luxury Blvd, Uptown District',
            coordinates: { lat: 40.7831, lng: -73.9712 },
            nearbyPlaces: {
                campus: { distance: 2000, duration: '20 minutes walk' },
                mosque: { name: 'Uptown Islamic Center', distance: 500, duration: '6 minutes walk' }
            }
        },
        images: [
            { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', alt: 'Luxury apartment', isPrimary: true }
        ],
        amenities: ['wifi', 'parking', 'gym', 'pool', 'security', 'air_conditioning'],
        specifications: {
            bedrooms: 3,
            bathrooms: 2,
            area: 1200,
            floor: 15,
            totalFloors: 20,
            furnished: 'semi'
        },
        availability: {
            isAvailable: false,
            availableFrom: '2024-12-01',
            minimumStay: 12
        },
        ratings: { average: 4.8, count: 25 },
        views: 156
    },
    {
        title: 'Budget 1BR Near Business School',
        description: 'Affordable option for business students. Great location with easy campus access.',
        type: 'apartment',
        price: 950,
        location: {
            address: '321 Business Ave, Commerce District',
            coordinates: { lat: 40.7282, lng: -74.0776 },
            nearbyPlaces: {
                campus: { distance: 400, duration: '4 minutes walk' }
            }
        },
        images: [
            { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', alt: 'One bedroom', isPrimary: true }
        ],
        amenities: ['wifi', 'laundry', 'heating'],
        specifications: {
            bedrooms: 1,
            bathrooms: 1,
            area: 600,
            floor: 1,
            totalFloors: 3,
            furnished: 'unfurnished'
        },
        availability: {
            isAvailable: true,
            availableFrom: '2024-09-01',
            minimumStay: 6
        },
        ratings: { average: 4.0, count: 15 },
        views: 78
    },
    // Garages
    {
        title: 'Secure Parking Garage Downtown',
        description: 'Safe and secure parking space in downtown area with 24/7 security monitoring and easy access.',
        type: 'garage',
        price: 150,
        location: {
            address: '456 Downtown St, City Center',
            coordinates: { lat: 40.7505, lng: -73.9934 }
        },
        images: [
            { url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800', alt: 'Secure garage', isPrimary: true }
        ],
        amenities: ['security', 'covered'],
        specifications: {
            area: 200,
            floor: 1,
            totalFloors: 3,
            furnished: 'unfurnished'
        },
        availability: {
            isAvailable: true,
            availableFrom: '2024-08-01',
            minimumStay: 1
        },
        ratings: { average: 4.2, count: 8 },
        views: 45
    },
    {
        title: 'Underground Parking Near Campus',
        description: 'Climate-controlled underground parking perfect for protecting your vehicle year-round.',
        type: 'garage',
        price: 120,
        location: {
            address: '234 Campus Drive, University District',
            coordinates: { lat: 40.7282, lng: -74.0776 }
        },
        images: [
            { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', alt: 'Underground garage', isPrimary: true }
        ],
        amenities: ['security', 'covered', 'air_conditioning'],
        specifications: {
            area: 180,
            floor: -1,
            totalFloors: 2,
            furnished: 'unfurnished'
        },
        availability: {
            isAvailable: true,
            availableFrom: '2024-09-01',
            minimumStay: 3
        },
        ratings: { average: 4.5, count: 12 },
        views: 67
    }
];

// Seed properties
const seedProperties = async () => {
    try {
        await connectDB();

        // Find an owner user (or create one)
        let owner = await User.findOne({ email: 'owner@tenanthub.test' }) || await User.findOne({ role: 'owner' });
        if (!owner) {
            console.log('No owner found. Creating default owner...');
            owner = await User.create({
                name: 'John Smith',
                email: 'owner@tenanthub.test',
                password: 'TenantHub123!',
                role: 'owner',
                phone: '+1234567890'
            });
        }

        // Clear existing properties
        await Property.deleteMany({});
        console.log('Existing properties cleared');

        // Add owner to each property
        const propertiesWithOwner = sampleProperties.map(property => ({
            ...property,
            owner: owner._id
        }));

        // Insert properties
        const properties = await Property.create(propertiesWithOwner);
        console.log(`${properties.length} properties created successfully`);

        // Update ratings for properties with reviews
        for (let property of properties) {
            if (property.reviews && property.reviews.length > 0) {
                property.calculateAverageRating();
                await property.save();
            }
        }

        console.log('Property seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding properties:', error);
        process.exit(1);
    }
};

// Run seeder
if (require.main === module) {
    seedProperties();
}

module.exports = { seedProperties, sampleProperties };
