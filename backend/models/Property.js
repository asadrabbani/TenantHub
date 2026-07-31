const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        maxlength: 100
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: 1000
    },
    type: {
        type: String,
        required: [true, 'Please specify property type'],
        enum: ['apartment', 'garage']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price']
    },
    location: {
        address: {
            type: String,
            required: [true, 'Please provide an address']
        },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        },
        nearbyPlaces: {
            campus: {
                distance: Number,
                duration: String
            },
            mosque: {
                name: String,
                distance: Number,
                duration: String
            },
            transportation: [
                {
                    transportType: {
                        type: String,
                        enum: ['bus_stop', 'metro', 'train', 'rickshaw', 'other']
                    },
                    distance: {
                        type: Number,
                        required: true
                    }
                }
            ]
        }
    },
    images: [{
        url: String,
        alt: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    amenities: [{
        type: String,
        enum: [
            'wifi', 'parking', 'gym', 'pool', 'laundry', 
            'security', 'elevator', 'balcony', 'furnished',
            'air_conditioning', 'heating', 'kitchen', 'garden', 'covered'
        ]
    }],
    specifications: {
        bedrooms: { type: Number, default: 0 },
        bathrooms: { type: Number, default: 0 },
        area: { type: Number }, // in sq ft
        floor: { type: Number },
        totalFloors: { type: Number },
        furnished: {
            type: String,
            enum: ['fully', 'semi', 'unfurnished'],
            default: 'unfurnished'
        }
    },
    availability: {
        isAvailable: {
            type: Boolean,
            default: true
        },
        availableFrom: {
            type: Date,
            default: Date.now
        },
        minimumStay: {
            type: Number, // in months
            default: 1
        }
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    reviews: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
propertySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate average rating
propertySchema.methods.calculateAverageRating = function() {
    if (this.reviews.length === 0) {
        this.ratings.average = 0;
        this.ratings.count = 0;
        return;
    }

    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = Math.ceil(totalRating / this.reviews.length * 10) / 10;
    this.ratings.count = this.reviews.length;
};

module.exports = mongoose.model('Property', propertySchema);
