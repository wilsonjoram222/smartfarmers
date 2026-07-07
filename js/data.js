// ============================================================
// DATA STORE – All mock data for Smart Farmers
// ============================================================

// Category data
const categoryData = {
    'Seeds': ['Maize', 'Beans', 'Cassava', 'Tomato', 'Pepper'],
    'Fertilizers': ['NPK', 'Urea', 'Organic', 'Compost'],
    'Crop Protection': ['Insecticides', 'Herbicides', 'Fungicides'],
    'Tools': ['Hand Tools', 'Power Tools', 'Irrigation', 'Sprayers'],
    'Livestock': ['Poultry', 'Cattle', 'Goats', 'Pigs'],
    'Harvest': ['Storage', 'Packaging', 'Processing']
};
const categoryIcons = {
    'Seeds': 'fa-seedling',
    'Fertilizers': 'fa-flask',
    'Crop Protection': 'fa-bug',
    'Tools': 'fa-tools',
    'Livestock': 'fa-paw',
    'Harvest': 'fa-warehouse'
};
const categoryColors = {
    'Seeds': '#4CAF50',
    'Fertilizers': '#FF9800',
    'Crop Protection': '#F44336',
    'Tools': '#2196F3',
    'Livestock': '#9C27B0',
    'Harvest': '#795548'
};

// Products
let products = [
    { id: 1, name: 'Hybrid Maize Seed – SC 403', desc: 'High-yield drought-tolerant maize, 90-day maturity.', price: 4500, originalPrice: 5500, category: 'Seeds', subcategory: 'Maize', icon: 'fa-seedling', rating: 4.8, reviews: 124, unit: 'kg', badge: 'Best Seller', inStock: true, brand: 'AgriSeed', seller: 'AgriSeed Co. Ltd', vendorId: 1, variations: [{name:'1kg',price:4500,stock:100},{name:'5kg',price:20000,stock:50}], images: [], isVariable: true, featured: true },
    { id: 2, name: 'NPK 15-15-15 Fertilizer', desc: 'Balanced granular fertilizer for all crops.', price: 12500, originalPrice: 14500, category: 'Fertilizers', subcategory: 'NPK', icon: 'fa-flask', rating: 4.6, reviews: 87, unit: 'bag', badge: 'Deal', inStock: true, brand: 'GreenGrow', seller: 'GreenGrow Industries', vendorId: 2, variations: [{name:'25kg',price:6800,stock:80},{name:'50kg',price:12500,stock:40}], images: [], isVariable: true, featured: false },
    { id: 3, name: 'Organic Compost Plus', desc: 'Enriched organic manure with beneficial microbes.', price: 6800, originalPrice: 7500, category: 'Fertilizers', subcategory: 'Organic', icon: 'fa-leaf', rating: 4.7, reviews: 53, unit: 'bag', badge: '', inStock: true, brand: 'EcoFarm', seller: 'EcoFarm Organics', vendorId: 3, variations: [{name:'10kg',price:3200,stock:60},{name:'25kg',price:6800,stock:40}], images: [], isVariable: true, featured: true },
    { id: 4, name: 'Insecticide – PestShield', desc: 'Broad-spectrum liquid insecticide. 1L bottle.', price: 3200, originalPrice: 4000, category: 'Crop Protection', subcategory: 'Insecticides', icon: 'fa-bug', rating: 4.4, reviews: 32, unit: 'L', badge: '', inStock: true, brand: 'FarmPro', seller: 'FarmPro Chemicals', vendorId: 1, variations: [{name:'500ml',price:1800,stock:100},{name:'1L',price:3200,stock:60}], images: [], isVariable: true, featured: false },
    { id: 5, name: 'Tomato Seed – Rio Grande', desc: 'Disease-resistant tomato variety.', price: 2800, originalPrice: 3000, category: 'Seeds', subcategory: 'Tomato', icon: 'fa-seedling', rating: 4.5, reviews: 68, unit: 'pack', badge: 'Top Rated', inStock: true, brand: 'HarvestKing', seller: 'HarvestKing Seeds', vendorId: 2, variations: [{name:'100 seeds',price:2800,stock:50},{name:'500 seeds',price:12000,stock:20}], images: [], isVariable: true, featured: false },
    { id: 6, name: 'Handheld Sprayer 16L', desc: 'Heavy-duty manual sprayer with adjustable nozzle.', price: 9500, originalPrice: 11000, category: 'Tools', subcategory: 'Sprayers', icon: 'fa-tools', rating: 4.3, reviews: 41, unit: 'unit', badge: '', inStock: true, brand: 'FarmPro', seller: 'FarmPro Equipment', vendorId: 3, variations: [{name:'16L',price:9500,stock:30},{name:'20L',price:12000,stock:20}], images: [], isVariable: true, featured: true },
    { id: 7, name: 'Herbicide – WeedFree', desc: 'Selective post-emergence herbicide. 500ml bottle.', price: 4100, originalPrice: 4600, category: 'Crop Protection', subcategory: 'Herbicides', icon: 'fa-bug', rating: 4.2, reviews: 29, unit: 'bottle', badge: '', inStock: true, brand: 'GreenGrow', seller: 'GreenGrow Industries', vendorId: 1, variations: [{name:'250ml',price:2400,stock:80},{name:'500ml',price:4100,stock:50}], images: [], isVariable: true, featured: false },
    { id: 8, name: 'Cassava Stems – TME 419', desc: 'High-starch cassava variety. Bundle of 50 stems.', price: 7500, originalPrice: 8500, category: 'Seeds', subcategory: 'Cassava', icon: 'fa-seedling', rating: 4.9, reviews: 92, unit: 'bundle', badge: 'Best Seller', inStock: true, brand: 'AgriSeed', seller: 'AgriSeed Co. Ltd', vendorId: 2, variations: [{name:'25 stems',price:4200,stock:40},{name:'50 stems',price:7500,stock:30}], images: [], isVariable: true, featured: false },
    { id: 9, name: 'Electric Water Pump 1HP', desc: 'Submersible pump for irrigation. 1HP, 220V.', price: 28500, originalPrice: 32000, category: 'Tools', subcategory: 'Irrigation', icon: 'fa-water', rating: 4.7, reviews: 56, unit: 'unit', badge: 'Deal', inStock: true, brand: 'HarvestKing', seller: 'HarvestKing Equipment', vendorId: 3, variations: [{name:'0.5HP',price:18500,stock:15},{name:'1HP',price:28500,stock:10}], images: [], isVariable: true, featured: true },
    { id: 10, name: 'Organic Pesticide – Neem Oil', desc: 'Natural insect repellent. 500ml bottle.', price: 2400, originalPrice: 2800, category: 'Crop Protection', subcategory: 'Organic', icon: 'fa-leaf', rating: 4.6, reviews: 44, unit: 'bottle', badge: '', inStock: true, brand: 'EcoFarm', seller: 'EcoFarm Organics', vendorId: 1, variations: [{name:'250ml',price:1400,stock:100},{name:'500ml',price:2400,stock:70}], images: [], isVariable: true, featured: false },
    { id: 11, name: 'Fertilizer Spreader', desc: 'Manual push spreader for granular fertilizers.', price: 15600, originalPrice: 18000, category: 'Tools', subcategory: 'Hand Tools', icon: 'fa-tractor', rating: 4.4, reviews: 23, unit: 'unit', badge: '', inStock: true, brand: 'FarmPro', seller: 'FarmPro Equipment', vendorId: 2, variations: [{name:'25L',price:15600,stock:20},{name:'50L',price:22000,stock:10}], images: [], isVariable: true, featured: false },
    { id: 12, name: 'Cowpea Seed – IT89KD-391', desc: 'High-yielding cowpea variety. Drought tolerant.', price: 3200, originalPrice: 3500, category: 'Seeds', subcategory: 'Beans', icon: 'fa-seedling', rating: 4.8, reviews: 77, unit: 'kg', badge: 'Top Rated', inStock: true, brand: 'HarvestKing', seller: 'HarvestKing Seeds', vendorId: 3, variations: [{name:'1kg',price:3200,stock:60},{name:'5kg',price:15000,stock:30}], images: [], isVariable: true, featured: false }
];

// Consultants
let consultants = [
    { id: 1, name: 'Dr. Adeyemi Ogunbiyi', specialty: 'Crop Science & Soil Health', rating: 4.9, reviews: 87, icon: 'fa-user-graduate', bio: 'PhD in Agronomy with 15 years experience.', email: 'adeyemi@example.com', approved: true, services: [{id:1, title:'Soil Testing', description:'Comprehensive soil health assessment', price:'UGX 50,000', views:0},{id:2, title:'Crop Disease Diagnosis', description:'Identify and treat crop diseases', price:'UGX 75,000', views:0}], feedbacks: [] },
    { id: 2, name: 'Engr. Funmi Adebayo', specialty: 'Farm Machinery & Irrigation', rating: 4.8, reviews: 63, icon: 'fa-user-tie', bio: 'Agricultural engineer specializing in irrigation.', email: 'funmi@example.com', approved: true, services: [{id:3, title:'Irrigation Design', description:'Design efficient irrigation systems', price:'UGX 100,000', views:0}], feedbacks: [] },
    { id: 3, name: 'Dr. Chidi Okonkwo', specialty: 'Livestock & Poultry Management', rating: 4.7, reviews: 52, icon: 'fa-user-md', bio: 'Veterinary doctor with expertise in poultry.', email: 'chidi@example.com', approved: true, services: [{id:4, title:'Poultry Health', description:'Comprehensive poultry health management', price:'UGX 80,000', views:0}], feedbacks: [] }
];

// Financial Institutions
let financialInstitutions = [
    { id: 1, name: 'Stanbic Bank Agri-Finance', type: 'Bank', approved: true, email: 'stanbic@example.com', services: [{id:1, title:'Farm Input Loans', description:'Buy now, pay after harvest', rate:'From 8% APR', views:0}], feedbacks: [] },
    { id: 2, name: 'Centenary Bank', type: 'Bank', approved: true, email: 'centenary@example.com', services: [{id:2, title:'Equipment Financing', description:'Lease tractors and machinery', rate:'From 12% APR', views:0}], feedbacks: [] }
];

// Vendors
let vendors = [
    { id: 1, vendorId: 'VENDOR-1001', name: 'AgriSeed Co. Ltd', storeName: 'AgriSeed Store', goodsTypes: ['Seeds', 'Fertilizers'], desc: 'Premium seeds and crop inputs', location: 'Kampala, Uganda', phone: '+256 700 123 456', email: 'agriseed@example.com', approved: true, earnings: 1250000, balance: 450000, commission: 5, lat: 0.3136, lng: 32.5811 },
    { id: 2, vendorId: 'VENDOR-1002', name: 'GreenGrow Industries', storeName: 'GreenGrow Store', goodsTypes: ['Fertilizers', 'Crop Protection'], desc: 'Quality fertilizers and agro-chemicals', location: 'Jinja, Uganda', phone: '+256 700 123 457', email: 'greengrow@example.com', approved: true, earnings: 850000, balance: 320000, commission: 4, lat: 0.4390, lng: 33.2032 },
    { id: 3, vendorId: 'VENDOR-1003', name: 'EcoFarm Organics', storeName: 'EcoFarm Store', goodsTypes: ['Fertilizers', 'Crop Protection', 'Seeds'], desc: 'Organic farming solutions', location: 'Mbale, Uganda', phone: '+256 700 123 458', email: 'ecofarm@example.com', approved: true, earnings: 620000, balance: 180000, commission: 6, lat: 1.0821, lng: 34.1750 }
];

// Delivery Persons
let deliveryPersons = [];
let pendingDeliveryPersons = [];
let deliveryPersonIdCounter = 1;

// Orders
let orders = [];
let orderIdCounter = 1000;

// Delivery Requests
let deliveryRequests = [];
let deliveryRequestIdCounter = 1;

// Users
let users = [
    { id: 1, name: 'Admin User', email: 'admin@smartfarmers.ug', phone: '+256 700 000 000', password: 'admin123', role: 'admin', verified: true, approved: true },
    { id: 2, name: 'John Farmer', email: 'john@example.com', phone: '+256 700 123 456', password: 'farmer123', role: 'customer', verified: true, approved: true }
];

// Banners
let banners = [
    { id: 1, image: '', link: '#', title: '🌱 Summer Planting Sale', subtitle: 'Up to 30% off on seeds & fertilizers' },
    { id: 2, image: '', link: '#', title: '🚜 New Arrivals', subtitle: 'Check out the latest farm tools' },
    { id: 3, image: '', link: '#', title: '👨‍🌾 Expert Consultations', subtitle: 'Book a session with our agronomists' }
];

// Global state (will be used by other JS files)
let cart = [];
let currentUser = null;
let isSignUp = false;
let orderHistory = [];
let consultationHistory = [];
let consultationRequests = [];
let consultationRequestIdCounter = 1;
let productImages = {};
let wishlist = [];
let notifications = [];
let notificationIdCounter = 1;
let coupons = [];
let appliedCoupon = null;
let currentBannerIndex = 0;
let bannerInterval;
let otpCode = '';
let otpPendingUser = null;
let dashboardActiveTab = 'overview';
let currency = { code: 'UGX', symbol: 'USh', rate: 3700 };
let globalCommission = 5;
let editingProductId = null;
let deliverySettings = {
    lightCargoRatePerKm: 500,
    heavyCargoRatePerKm: 1500,
    minimumDeliveryFee: 2000,
    maximumDistanceKm: 50,
    enableDeliveryFee: true
};
let productIdCounter = 13;
let vendorIdCounter = 4;
let userIdCounter = 3;

// Expose globally
window.categoryData = categoryData;
window.categoryIcons = categoryIcons;
window.categoryColors = categoryColors;
window.products = products;
window.consultants = consultants;
window.financialInstitutions = financialInstitutions;
window.vendors = vendors;
window.deliveryPersons = deliveryPersons;
window.pendingDeliveryPersons = pendingDeliveryPersons;
window.orders = orders;
window.deliveryRequests = deliveryRequests;
window.users = users;
window.banners = banners;
window.cart = cart;
window.currentUser = currentUser;
window.notifications = notifications;
window.coupons = coupons;
window.currency = currency;
window.deliverySettings = deliverySettings;
// ... etc