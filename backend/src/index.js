const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const vendorRoutes = require('./routes/vendors');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const tagRoutes = require('./routes/tags');
const orderRoutes = require('./routes/orders');
const deliveryRoutes = require('./routes/delivery');
const consultantRoutes = require('./routes/consultants');
const financialRoutes = require('./routes/financial');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const withdrawalRoutes = require('./routes/withdrawals');
const couponRoutes = require('./routes/coupons');
const cooperativeRoutes = require('./routes/cooperatives');
const agroDealerRoutes = require('./routes/agrodealers');
const transporterRoutes = require('./routes/transporters');
const regulatorRoutes = require('./routes/regulators');
const integrationRoutes = require('./routes/integrations');
const adRoutes = require('./routes/ads');
const digitalResourceRoutes = require('./routes/digitalResources');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Socket.io
const socketHandler = require('./socket');
socketHandler(io);

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/consultants', consultantRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/cooperatives', cooperativeRoutes);
app.use('/api/agrodealers', agroDealerRoutes);
app.use('/api/transporters', transporterRoutes);
app.use('/api/regulators', regulatorRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/digital-resources', digitalResourceRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Smart Farmers API is running' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('✅ Connected to MongoDB');

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});