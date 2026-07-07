const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../src/models/user');
const Vendor = require('../src/models/vendor');
const Category = require('../src/models/category');
const Brand = require('../src/models/brand');
const Tag = require('../src/models/tag');
const Product = require('../src/models/product');
const DeliverySettings = require('../src/models/DeliverySettings');
const Advertisement = require('../src/models/advertisement');
const AgroDealer = require('../src/models/agroDealer');
const AuditLog = require('../src/models/auditLog');
const Banner = require('../src/models/banner');
const Consultant = require('../src/models/consultant');
const Cooperative = require('../src/models/cooperative');
const Coupon = require('../src/models/coupon');
const DeliveryPerson = require('../src/models/DeliveryPerson');
const DeliveryRequest = require('../src/models/DeliveryRequest');
const DigitalResource = require('../src/models/digitalResource');
const DigitalResourcePurchase = require('../src/models/digitalResourcePurchase');
const FinancialInstitution = require('../src/models/financialInstitution');
const IntegrationConfig = require('../src/models/integrationConfig');
const IntegrationPartner = require('../src/models/integrationPartner');
const MobileMoneyTransaction = require('../src/models/mobileMoneyTransaction');
const Notification = require('../src/models/notification');
const Order = require('../src/models/order');
const Regulator = require('../src/models/regulator');
const Transporter = require('../src/models/transporter');
const Withdrawal = require('../src/models/withdrawal');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Vendor.deleteMany({});
        await Category.deleteMany({});
        await Brand.deleteMany({});
        await Tag.deleteMany({});
        await Product.deleteMany({});
        await DeliverySettings.deleteMany({});

        await Advertisement.deleteMany({});
        await AgroDealer.deleteMany({});
        await AuditLog.deleteMany({});
        await Banner.deleteMany({});
        await Consultant.deleteMany({});
        await Cooperative.deleteMany({});
        await Coupon.deleteMany({});
        await DeliveryPerson.deleteMany({});
        await DeliveryRequest.deleteMany({});
        await DigitalResource.deleteMany({});
        await DigitalResourcePurchase.deleteMany({});
        await FinancialInstitution.deleteMany({});
        await IntegrationConfig.deleteMany({});
        await IntegrationPartner.deleteMany({});
        await MobileMoneyTransaction.deleteMany({});
        await Notification.deleteMany({});
        await Order.deleteMany({});
        await Regulator.deleteMany({});
        await Transporter.deleteMany({});
        await Withdrawal.deleteMany({});

        console.log('Cleared all collections');

        // Admin
        const admin = new User({
            name: 'Admin User',
            email: 'admin@smartfarmers.ug',
            phone: '+256 700 000 000',
            password: 'admin123',
            role: 'admin',
            verified: true,
            approved: true
        });
        await admin.save();
        console.log('Admin created');

        // Vendors
        const vendor1 = new Vendor({
            name: 'AgriSeed Co. Ltd',
            storeName: 'AgriSeed Store',
            description: 'Premium seeds and crop inputs',
            goodsTypes: ['Seeds', 'Fertilizers'],
            location: { address: 'Kampala Road', city: 'Kampala', country: 'Uganda', lat: 0.3136, lng: 32.5811 },
            phone: '+256 700 123 456',
            email: 'vendor1@example.com',
            approved: true,
            commission: 5
        });
        await vendor1.save();

        const vendor2 = new Vendor({
            name: 'GreenGrow Industries',
            storeName: 'GreenGrow Store',
            description: 'Quality fertilizers and agro-chemicals',
            goodsTypes: ['Fertilizers', 'Crop Protection'],
            location: { address: 'Jinja Road', city: 'Jinja', country: 'Uganda', lat: 0.4390, lng: 33.2032 },
            phone: '+256 700 123 457',
            email: 'vendor2@example.com',
            approved: true,
            commission: 4
        });
        await vendor2.save();
        console.log('Vendors created');

        // Categories
        const categories = [
            { name: 'Seeds', slug: 'seeds', icon: 'fa-seedling', subcategories: [{ name: 'Maize', slug: 'maize' }, { name: 'Beans', slug: 'beans' }, { name: 'Cassava', slug: 'cassava' }] },
            { name: 'Fertilizers', slug: 'fertilizer', icon: 'fa-flask', subcategories: [{ name: 'NPK', slug: 'npk' }, { name: 'Urea', slug: 'urea' }, { name: 'Organic', slug: 'organic' }] },
            { name: 'Crop Protection', slug: 'pesticide', icon: 'fa-bug', subcategories: [{ name: 'Insecticides', slug: 'insecticides' }, { name: 'Herbicides', slug: 'herbicides' }] }
        ];
        for (const cat of categories) {
            const c = new Category(cat);
            await c.save();
        }
        console.log('Categories created');

        // Brands
        const brands = ['AgriSeed', 'GreenGrow', 'FarmPro', 'EcoFarm', 'HarvestKing'];
        for (const name of brands) {
            const b = new Brand({ name, slug: name.toLowerCase() });
            await b.save();
        }
        console.log('Brands created');

        // Tags
        const tags = ['Organic', 'Non-GMO', 'Drought Tolerant', 'High Yield', 'Disease Resistant'];
        for (const name of tags) {
            const t = new Tag({ name, slug: name.toLowerCase().replace(/\s+/g, '-') });
            await t.save();
        }
        console.log('Tags created');

        // Products
        const products = [
            { name: 'Hybrid Maize Seed – SC 403', description: 'High-yield drought-tolerant maize.', price: 4500, originalPrice: 5500, category: 'Seeds', subcategory: 'Maize', brand: 'AgriSeed', tags: ['Drought Tolerant', 'High Yield'], cargoType: 'light', isVariable: true, variations: [{ name: '1kg', price: 4500, stock: 100 }, { name: '5kg', price: 20000, stock: 50 }], inStock: true, featured: true, vendorId: vendor1._id, images: ['https://via.placeholder.com/200x200/4CAF50/ffffff?text=Maize'] },
            { name: 'NPK 15-15-15 Fertilizer', description: 'Balanced granular fertilizer.', price: 12500, originalPrice: 14500, category: 'Fertilizers', subcategory: 'NPK', brand: 'GreenGrow', tags: ['High Yield'], cargoType: 'heavy', isVariable: true, variations: [{ name: '25kg', price: 6800, stock: 80 }, { name: '50kg', price: 12500, stock: 40 }], inStock: true, featured: false, vendorId: vendor2._id, images: ['https://via.placeholder.com/200x200/FF9800/ffffff?text=NPK'] }
        ];
        for (const p of products) {
            const prod = new Product(p);
            await prod.save();
        }
        console.log('Products created');

        // Delivery Settings
        const settings = new DeliverySettings({
            lightCargoRatePerKm: 500,
            heavyCargoRatePerKm: 1500,
            minimumDeliveryFee: 2000,
            maximumDistanceKm: 50,
            enableDeliveryFee: true
        });
        await settings.save();
        console.log('Delivery settings created');

        console.log('✅ Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seed();