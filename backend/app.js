const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Route files
const auth = require('./routes/auth');
const properties = require('./routes/properties');
const bookings = require('./routes/bookings');
const notifications = require('./routes/notifications');
const dashboard = require('./routes/dashboard');
const reviews = require('./routes/reviews');
const commute = require('./routes/commute');
const bkash = require('./routes/bkash');

const app = express();

// Body parser middleware for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));







const allowedOrigins = [
  "https://tenanthub-theta.vercel.app",
  "https://tenanthub-jas51nozj-la-fox.vercel.app",
  "https://tenanthub-git-main-la-fox.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);

      return callback(
        new Error(`Origin is not allowed by CORS: ${origin}`)
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);








app.get('/api/health', (req, res) => {
    res.json({ success: true, service: 'TenantHub API', version: '2.0.0' });
});

// Mount routers
app.use('/api/auth', auth);
app.use('/api/properties', properties);
app.use('/api/bookings', bookings);
app.use('/api/notifications', notifications);
app.use('/api/dashboard', dashboard);
app.use('/api/reviews', reviews);
app.use('/api/commute', commute);
app.use('/api/bkash', bkash);

// Basic route for testing
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Tenant Management System API is running!',
        version: '2.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/me',
                updateProfile: 'PUT /api/auth/profile'
            },
            properties: {
                getAll: 'GET /api/properties',
                getSingle: 'GET /api/properties/:id',
                create: 'POST /api/properties',
                update: 'PUT /api/properties/:id',
                delete: 'DELETE /api/properties/:id',
                recommendations: 'GET /api/properties/user/recommendations'
            },
            bookings: {
                create: 'POST /api/bookings',
                getMyBookings: 'GET /api/bookings/my-bookings',
                getSingle: 'GET /api/bookings/:id',
                processPayment: 'POST /api/bookings/:id/payment',
                adminAction: 'PUT /api/bookings/:id/admin-action',
                getAllAdmin: 'GET /api/bookings/admin/all'
            },
            notifications: {
                getAll: 'GET /api/notifications',
                markRead: 'PUT /api/notifications/:id/read',
                markAllRead: 'PUT /api/notifications/mark-all-read',
                delete: 'DELETE /api/notifications/:id',
                create: 'POST /api/notifications (admin)',
                stats: 'GET /api/notifications/admin/stats (admin)'
            },
            dashboard: {
                ownerDashboard: 'GET /api/dashboard/owner',
                updateOwnerDashboard: 'PUT /api/dashboard/owner',
                monthlyReport: 'POST /api/dashboard/owner/reports/:month',
                financials: 'GET /api/dashboard/owner/financials',
                adminDashboard: 'GET /api/dashboard/admin',
                recommendationAnalytics: 'GET /api/dashboard/admin/recommendations'
            },
            reviews: {
                create: 'POST /api/reviews',
                getUserReviews: 'GET /api/reviews/user/:userId',
                getPropertyReviews: 'GET /api/reviews/property/:propertyId',
                markHelpful: 'PUT /api/reviews/:id/helpful',
                respond: 'PUT /api/reviews/:id/respond',
                flag: 'PUT /api/reviews/:id/flag',
                getFlagged: 'GET /api/reviews/admin/flagged (admin)',
                adminReview: 'PUT /api/reviews/:id/admin-review (admin)'
            },
            commute: {
                createRoute: 'POST /api/commute/routes',
                getRoutes: 'GET /api/commute/routes',
                getSingleRoute: 'GET /api/commute/routes/:id',
                updateRoute: 'PUT /api/commute/routes/:id',
                deleteRoute: 'DELETE /api/commute/routes/:id',
                toggleFavorite: 'PUT /api/commute/routes/:id/favorite',
                addAlert: 'POST /api/commute/routes/:id/alerts',
                nearbyMosques: 'GET /api/commute/nearby-mosques',
                propertiesWithCommute: 'GET /api/commute/properties-with-commute'
            }
        }
    });
});

// Handle unmatched routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

app.use((err, req, res, next) => {
    const status = err.name === 'ValidationError' || err.code === 11000 ? 400
        : err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' ? 401
        : err.message === 'Origin is not allowed by CORS' ? 403
        : err.statusCode || 500;
    const validationMessage = err.name === 'ValidationError'
        ? Object.values(err.errors).map(value => value.message).join(', ')
        : null;

    if (status >= 500) console.error(err);
    res.status(status).json({
        success: false,
        message: validationMessage || (err.code === 11000 ? 'A record with that value already exists' : err.message || 'Internal server error'),
    });
});

module.exports = app;
