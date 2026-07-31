const mongoose = require('mongoose');
const { seedProperties } = require('../seeders/propertySeeder');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load env vars
dotenv.config();

const runSeeders = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Connect to MongoDB
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!uri) throw new Error('Missing MONGODB_URI or MONGO_URI');
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        await Promise.all([
            User.deleteMany({ email: { $in: ['admin@tenanthub.test', 'owner@tenanthub.test', 'student@tenanthub.test'] } }),
        ]);
        await User.create([
            { name: 'Amina Rahman', email: 'admin@tenanthub.test', password: 'TenantHub123!', role: 'admin', phone: '+880 1700 100001' },
            { name: 'Farhan Ahmed', email: 'owner@tenanthub.test', password: 'TenantHub123!', role: 'owner', phone: '+880 1700 100002' },
            { name: 'Nadia Islam', email: 'student@tenanthub.test', password: 'TenantHub123!', role: 'user', phone: '+880 1700 100003' },
        ]);

        await seedProperties();
        
        console.log('🎉 Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

runSeeders();
