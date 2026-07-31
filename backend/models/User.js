const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'owner'],
        default: 'user'
    },
    phone: {
        type: String,
        maxlength: 20
    },
    preferences: {
        propertyType: {
            type: [String],
            enum: ['apartment', 'garage'],
            default: ['apartment']
        },
        priceRange: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 100000 }
        },
        location: {
            type: String,
            default: ''
        },
        amenities: {
            type: [String],
            default: []
        }
    },
    searchHistory: [{
        searchTerm: String,
        filters: Object,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    savedProperties: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Property'
    }],
    ownerProfile: {
        bio: {
            type: String,
            maxlength: 500
        },
        businessName: String,
        yearsExperience: Number,
        specializations: [{
            type: String,
            enum: ['apartments', 'garages', 'commercial', 'luxury', 'student_housing']
        }],
        ratings: {
            overall: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },
            communication: {
                type: Number,
                default: 0
            },
            responsiveness: {
                type: Number,
                default: 0
            },
            propertyCondition: {
                type: Number,
                default: 0
            },
            value: {
                type: Number,
                default: 0
            },
            count: {
                type: Number,
                default: 0
            }
        },
        averageResponseTime: {
            type: Number, // in hours
            default: 0
        },
        totalProperties: {
            type: Number,
            default: 0
        },
        activeListings: {
            type: Number,
            default: 0
        },
        completedTransactions: {
            type: Number,
            default: 0
        },
        verificationStatus: {
            isVerified: {
                type: Boolean,
                default: false
            },
            verifiedAt: Date,
            verificationDocuments: [{
                type: String,
                url: String,
                status: {
                    type: String,
                    enum: ['pending', 'approved', 'rejected'],
                    default: 'pending'
                }
            }]
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
