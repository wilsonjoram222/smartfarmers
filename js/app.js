// ============================================================
// SMART FARMERS – MAIN APPLICATION
// ============================================================

// ---- UTILITY FUNCTIONS ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function formatPrice(priceUSD) {
    const local = priceUSD * currency.rate;
    return `${currency.symbol} ${local.toLocaleString()}`;
}

function toast(type, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconMap = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    toast.innerHTML = `<i class="fas ${iconMap[type] || 'fa-bell'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
}
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) { this.classList.remove('open'); document.body.style.overflow = ''; }
    });
});

function saveState() {
    try {
        const state = { cart, currentUser, orderHistory, consultationHistory, consultationRequests, notifications, coupons, banners, products, vendors, deliveryPersons, deliveryRequests, orders };
        localStorage.setItem('smartFarmersState', JSON.stringify(state));
    } catch (_) {}
}
function loadState() {
    try {
        const raw = localStorage.getItem('smartFarmersState');
        if (!raw) return;
        const state = JSON.parse(raw);
        cart = state.cart || [];
        currentUser = state.currentUser || null;
        orderHistory = state.orderHistory || [];
        consultationHistory = state.consultationHistory || [];
        consultationRequests = state.consultationRequests || [];
        notifications = state.notifications || [];
        coupons = state.coupons || [];
        banners = state.banners || banners;
        if (state.products) products = state.products;
        if (state.vendors) vendors = state.vendors;
        if (state.deliveryPersons) deliveryPersons = state.deliveryPersons;
        if (state.deliveryRequests) deliveryRequests = state.deliveryRequests;
        if (state.orders) orders = state.orders;
        updateCartUI();
        updateAuthUI();
        updateNotificationBadge();
    } catch (_) {}
}

// ---- NAVIGATION ----
function navigateTo(section) {
    $$('.page-section').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`section-${section}`);
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (section === 'dashboard') renderDashboard();
    if (section === 'checkout') renderCheckout();
    updateAuthUI();
}

function toggleSideMenu() {
    document.getElementById('sideMenu').classList.toggle('open');
    document.getElementById('sideMenuOverlay').classList.toggle('open');
    document.body.style.overflow = document.getElementById('sideMenu').classList.contains('open') ? 'hidden' : '';
}

// ---- THEME ----
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}
function applyTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
}

// ---- BANNERS ----
function renderBanners() {
    const slides = document.getElementById('bannerSlides');
    const dots = document.getElementById('bannerDots');
    slides.innerHTML = '';
    dots.innerHTML = '';
    if (!banners.length || banners.every(b => !b.title && !b.image)) {
        slides.innerHTML = `<div class="banner-slide"><div class="banner-content"><h2>🌱 Smart Farmers</h2><p>Your trusted agri-marketplace</p></div></div>`;
        dots.innerHTML = '<span class="active"></span>';
        return;
    }
    banners.forEach((b, i) => {
        const slide = document.createElement('div');
        slide.className = 'banner-slide';
        slide.innerHTML = `<div class="banner-content">${b.image ? `<img src="${b.image}" alt="Banner" style="max-height:130px; width:auto;" />` : ''}<h2>${b.title || 'Special Offer'}</h2><p>${b.subtitle || ''}</p>${b.link && b.link !== '#' ? `<a href="${b.link}" style="display:inline-block; margin-top:4px; background:var(--primary); color:#111; padding:3px 14px; border-radius:16px; font-weight:600; font-size:0.75rem;">Shop Now</a>` : ''}</div>`;
        slides.appendChild(slide);
        const dot = document.createElement('span');
        dot.dataset.index = i;
        dot.addEventListener('click', () => goToBanner(i));
        dots.appendChild(dot);
    });
    goToBanner(0);
}
function goToBanner(index) {
    const slides = document.getElementById('bannerSlides');
    const total = banners.length || 1;
    currentBannerIndex = (index + total) % total;
    slides.style.transform = `translateX(-${currentBannerIndex * 100}%)`;
    document.querySelectorAll('#bannerDots span').forEach((dot, i) => { dot.classList.toggle('active', i === currentBannerIndex); });
}
function moveBanner(direction) { goToBanner(currentBannerIndex + direction); resetBannerAutoSlide(); }
function startBannerAutoSlide() { bannerInterval = setInterval(() => moveBanner(1), 5000); }
function resetBannerAutoSlide() { clearInterval(bannerInterval); startBannerAutoSlide(); }

// ---- SIDE MENU CATEGORIES ----
function renderSideMenu() {
    const container = document.getElementById('sideMenuCategories');
    let html = '';
    for (const [cat, subs] of Object.entries(categoryData)) {
        const icon = categoryIcons[cat] || 'fa-tag';
        html += `<div class="menu-item" onclick="toggleSubMenu(this)"><span class="icon"><i class="fas ${icon}"></i></span><span class="label">${cat}</span><span class="arrow"><i class="fas fa-chevron-right"></i></span></div><div class="sub-items">${subs.map(sub => `<div class="sub-item" onclick="navigateTo('marketplace'); filterSubcategory('${cat}','${sub}'); toggleSideMenu();">${sub}</div>`).join('')}</div>`;
    }
    container.innerHTML = html;
}
function toggleSubMenu(el) {
    const sub = el.nextElementSibling;
    if (sub && sub.classList.contains('sub-items')) {
        sub.classList.toggle('open');
        const arrow = el.querySelector('.arrow i');
        if (arrow) { arrow.classList.toggle('fa-chevron-right'); arrow.classList.toggle('fa-chevron-down'); }
    }
}
function filterSubcategory(category, subcategory) {
    $('#filterCategory').value = category.toLowerCase();
    $('#marketSearch').value = subcategory;
    filterProducts();
}

// ---- CATEGORY GRID ----
function renderCategories() {
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = '';
    for (const [cat, subs] of Object.entries(categoryData)) {
        const icon = categoryIcons[cat] || 'fa-tag';
        const color = categoryColors[cat] || '#FF9900';
        grid.innerHTML += `<div class="category-item" onclick="navigateTo('marketplace'); filterCategory('${cat.toLowerCase()}')"><i class="fas ${icon}" style="color:${color};"></i><span>${cat}</span></div>`;
    }
}

// ---- SEARCH ----
function performSearch() {
    const category = $('#searchCategory').value;
    const query = $('#searchInput').value.trim();
    if (category === 'consultants') {
        const filtered = consultants.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.specialty.toLowerCase().includes(query.toLowerCase()));
        if (filtered.length) {
            navigateTo('consultants');
            document.getElementById('consultantFullGrid').innerHTML = filtered.map(c => `<div class="consultant-card"><div class="avatar"><i class="fas ${c.icon}"></i></div><h4>${c.name}</h4><div class="specialty">${c.specialty}</div><div class="rating"><i class="fas fa-star"></i> ${c.rating} (${c.reviews})</div><button class="book-btn" onclick="openBookModal('${c.name}')">Book</button></div>`).join('');
            toast('info', `Found ${filtered.length} consultant(s)`);
        } else { navigateTo('consultants'); renderConsultantsFull(); toast('info', 'No consultants found'); }
        return;
    }
    navigateTo('marketplace');
    $('#filterCategory').value = category === 'all' ? 'all' : category;
    $('#marketSearch').value = query;
    filterProducts();
}

// ---- PRODUCT FUNCTIONS ----
function createProductCard(p) {
    const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const imageUrl = productImages[p.id] || null;
    const ratingStars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));
    const localPrice = formatPrice(p.price);
    const localOriginal = p.originalPrice ? formatPrice(p.originalPrice) : '';
    const vendor = vendors.find(v => v.id === p.vendorId);
    const isDeal = [2, 5, 8, 11].includes(p.id);
    const isFeatured = p.featured === true;
    let badgeHtml = '';
    if (p.badge) badgeHtml += `<span class="badge">${p.badge}</span>`;
    if (isFeatured) badgeHtml += `<span class="featured-badge" style="position:absolute; top:4px; right:4px; background:var(--primary); color:#111; font-size:0.55rem; font-weight:700; padding:1px 8px; border-radius:8px;">⭐ Featured</span>`;
    if (isDeal) badgeHtml += `<span class="deal-badge" style="position:absolute; top:4px; right:4px; background:var(--danger); color:#fff; font-size:0.55rem; font-weight:700; padding:1px 8px; border-radius:8px;">🔥 Deal</span>`;
    return `<div class="product-card" data-id="${p.id}">${badgeHtml}<div class="image">${imageUrl ? `<img src="${imageUrl}" />` : `<i class="fas ${p.icon}"></i>`}</div><div class="title">${p.name}</div><div class="rating"><span>${ratingStars}</span> <span>${p.rating} (${p.reviews})</span></div><div class="price">${localPrice}${p.originalPrice ? `<span class="original">${localOriginal}</span>` : ''}${discount > 0 ? `<span class="discount">-${discount}%</span>` : ''}</div><div class="seller">by <strong>${vendor ? vendor.storeName : p.seller}</strong></div><div class="footer"><span class="stock ${p.inStock ? '' : 'out'}">${p.inStock ? 'In stock' : 'Out of stock'}</span><button class="btn-add" onclick="event.stopPropagation(); addToCart(${p.id})" ${!p.inStock ? 'disabled style="opacity:0.5;"' : ''}><i class="fas fa-plus"></i> Add</button></div></div>`;
}

function renderHomeProducts() {
    const grid = document.getElementById('homeProductGrid');
    const featured = products.slice(0, 6);
    grid.innerHTML = featured.map(p => createProductCard(p)).join('');
}
function renderTopSellers() {
    const grid = document.getElementById('topSellersGrid');
    const top = products.filter(p => p.badge === 'Best Seller' || p.badge === 'Top Rated').slice(0, 4);
    grid.innerHTML = top.length ? top.map(p => createProductCard(p)).join('') : products.slice(6, 10).map(p => createProductCard(p)).join('');
}
function filterProducts() {
    const grid = document.getElementById('productGrid');
    const cat = $('#filterCategory').value;
    const search = $('#marketSearch').value.toLowerCase();
    let filtered = products.filter(p => { if (cat !== 'all' && p.category.toLowerCase() !== cat) return false; if (search && !p.name.toLowerCase().includes(search) && !p.desc.toLowerCase().includes(search) && !p.brand.toLowerCase().includes(search)) return false; return true; });
    if (!filtered.length) { grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; color:var(--text-secondary);">No products found.</div>`; return; }
    grid.innerHTML = filtered.map(p => createProductCard(p)).join('');
}
function filterCategory(cat) { navigateTo('marketplace'); $('#filterCategory').value = cat; $('#marketSearch').value = ''; filterProducts(); }

// ---- ADVERT FEED ----
function getAllAdverts() {
    let adverts = [];
    products.forEach(p => {
        const vendor = vendors.find(v => v.id === p.vendorId);
        adverts.push({ id: p.id, type: 'product', title: p.name, description: p.desc, price: p.price, category: p.category, ownerId: p.vendorId, ownerName: vendor ? vendor.storeName : 'Unknown Vendor', ownerEmail: vendor ? vendor.email : null, image: p.images && p.images.length > 0 ? p.images[0] : '', status: p.status || 'active', createdAt: p.createdAt || new Date().toISOString(), originalData: p });
    });
    consultants.forEach(c => {
        c.services.forEach(s => {
            adverts.push({ id: s.id, type: 'consultant_service', title: s.title, description: s.description, price: s.price || 'Contact for pricing', category: 'Consultation', ownerId: c.id, ownerName: c.name, ownerEmail: c.email, image: '', status: s.status || 'active', createdAt: s.createdAt || new Date().toISOString(), originalData: s });
        });
    });
    financialInstitutions.forEach(f => {
        f.services.forEach(s => {
            adverts.push({ id: s.id, type: 'financial_service', title: s.title, description: s.description, price: s.rate || 'Contact for rates', category: 'Finance', ownerId: f.id, ownerName: f.name, ownerEmail: f.email, image: '', status: s.status || 'active', createdAt: s.createdAt || new Date().toISOString(), originalData: s });
        });
    });
    adverts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return adverts;
}

function renderAdvertFeed() {
    const container = document.getElementById('advertFeed');
    if (!container) return;
    const adverts = getAllAdverts();
    if (!adverts.length) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No adverts available yet.</p>';
        return;
    }
    let html = `<div class="section-header"><h2><i class="fas fa-bullhorn" style="color:var(--primary);"></i> Latest Offers & Services</h2><p style="color:var(--text-muted);">From our trusted vendors, consultants, and financial partners</p></div><div class="advert-grid">`;
    adverts.slice(0, 12).forEach(ad => {
        const priceDisplay = typeof ad.price === 'number' ? formatPrice(ad.price) : ad.price;
        html += `<div class="advert-card" data-id="${ad.id}" data-type="${ad.type}">${ad.image ? `<div class="advert-image"><img src="${ad.image}" alt="${ad.title}" /></div>` : `<div class="advert-image" style="background:var(--bg-body);"><i class="fas fa-image" style="font-size:2rem; color:var(--text-muted);"></i></div>`}<div class="advert-body"><div class="advert-title">${ad.title}</div><div class="advert-desc">${ad.description ? ad.description.substring(0, 80) + '...' : ''}</div><div class="advert-meta"><span class="advert-price">${priceDisplay}</span><span class="advert-owner">by ${ad.ownerName}</span></div><div class="advert-tags"><span class="badge-tag">${ad.type.replace('_', ' ')}</span><span class="badge-tag" style="background:var(--bg-body); color:var(--text-muted);">${ad.category || 'General'}</span></div></div></div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// ---- CONSULTANTS ----
function renderConsultantMini() {
    const grid = document.getElementById('consultantMiniGrid');
    const approved = consultants.filter(c => c.approved !== false);
    grid.innerHTML = approved.map(c => `<div class="consultant-mini-card" onclick="navigateTo('consultants')"><div class="avatar"><i class="fas ${c.icon}"></i></div><h4>${c.name}</h4><div class="specialty">${c.specialty}</div><div class="rating"><i class="fas fa-star"></i> ${c.rating}</div></div>`).join('');
}
function renderConsultantsFull() {
    const grid = document.getElementById('consultantFullGrid');
    const approved = consultants.filter(c => c.approved !== false);
    grid.innerHTML = approved.map(c => `<div class="consultant-card"><div class="avatar"><i class="fas ${c.icon}"></i></div><h4>${c.name}</h4><div class="specialty">${c.specialty}</div><div class="rating"><i class="fas fa-star"></i> ${c.rating} (${c.reviews})</div><button class="book-btn" onclick="openBookModal('${c.name}')">Book Consultation</button></div>`).join('');
}
let bookingConsultantName = '';
function openBookModal(name) {
    bookingConsultantName = name;
    document.getElementById('bookConsultantName').textContent = `with ${name}`;
    openModal('bookModal');
}
function bookConsultant(e) {
    e.preventDefault();
    if (!currentUser) { toast('info', 'Please sign in to book.'); closeModal('bookModal'); openModal('authModal'); return; }
    const date = e.target.querySelector('input[type="date"]').value;
    const time = e.target.querySelector('select').value;
    if (!date || !time) { toast('error', 'Please select date and time.'); return; }
    consultationHistory.push({ consultant: bookingConsultantName, date, time, status: 'Scheduled' });
    toast('success', `✅ Booked with ${bookingConsultantName} on ${date}!`);
    closeModal('bookModal');
    saveState();
    renderDashboard();
}

// ---- FINANCE ----
function renderFinanceMini() {
    const grid = document.getElementById('financialMiniGrid');
    const approved = financialInstitutions.filter(f => f.approved !== false);
    grid.innerHTML = approved.map(f => `<div class="consultant-mini-card" onclick="navigateTo('finance')"><div style="font-size:1.8rem; color:var(--primary);"><i class="fas ${f.icon}"></i></div><h4 style="font-size:0.8rem;">${f.name}</h4><div style="font-size:0.75rem; color:var(--primary-dark-orange); font-weight:700;">${f.rate}</div></div>`).join('');
}
function renderFinanceFull() {
    const grid = document.getElementById('financeFullGrid');
    const approved = financeProducts.filter(f => f.approved !== false);
    grid.innerHTML = approved.map(f => `<div class="finance-card"><div class="icon"><i class="fas ${f.icon}"></i></div><h4>${f.name}</h4><div class="rate">${f.rate}</div><p>${f.desc}</p><button class="btn-learn" onclick="toast('info', 'Coming soon: ${f.name}')">Learn More</button></div>`).join('');
}

// ---- CONSULTATION REQUEST ----
function submitConsultationRequest(e) {
    e.preventDefault();
    if (!currentUser) { toast('info', 'Please sign in to submit a consultation request.'); closeModal('consultationModal'); openModal('authModal'); return; }
    const type = document.getElementById('consultationType').value;
    const targetId = parseInt(document.getElementById('consultationTargetId').value);
    const fullName = document.getElementById('cons_fullName').value.trim();
    const phone = document.getElementById('cons_phone').value.trim();
    const email = document.getElementById('cons_email').value.trim();
    const location = document.getElementById('cons_location').value.trim();
    const inquiryType = document.getElementById('cons_inquiryType').value;
    const description = document.getElementById('cons_description').value.trim();
    const contactMethod = document.getElementById('cons_contactMethod').value;
    if (!fullName || !phone || !email || !description) { toast('error', 'Please fill in all required fields.'); return; }
    let targetName = '', targetEmail = '';
    if (type === 'consultant') {
        const consultant = consultants.find(c => c.id === targetId);
        if (consultant) { targetName = consultant.name; targetEmail = consultant.email; }
    } else {
        const institution = financialInstitutions.find(f => f.id === targetId);
        if (institution) { targetName = institution.name; targetEmail = institution.email; }
    }
    const request = { id: consultationRequestIdCounter++, type, targetId, targetName, targetEmail, customerName: fullName, customerPhone: phone, customerEmail: email, customerLocation: location || 'N/A', inquiryType, description, contactMethod, status: 'pending', createdAt: new Date().toISOString(), response: null, respondedAt: null };
    consultationRequests.push(request);
    if (type === 'consultant') {
        const consultant = consultants.find(c => c.id === targetId);
        if (consultant) { if (!consultant.feedbacks) consultant.feedbacks = []; consultant.feedbacks.push({ id: request.id, customerName: fullName, inquiryType, description, date: new Date().toISOString(), status: 'pending' }); }
    } else {
        const institution = financialInstitutions.find(f => f.id === targetId);
        if (institution) { if (!institution.feedbacks) institution.feedbacks = []; institution.feedbacks.push({ id: request.id, customerName: fullName, inquiryType, description, date: new Date().toISOString(), status: 'pending' }); }
    }
    addNotification(targetEmail, 'New Consultation Request', `${fullName} has requested a consultation. Type: ${inquiryType}`, 'info');
    addNotification('admin', 'New Consultation Request', `${fullName} requested consultation from ${targetName} (${type})`, 'warning');
    toast('success', `✅ Your consultation request has been sent to ${targetName}.`);
    closeModal('consultationModal');
    document.getElementById('consultationForm').reset();
    saveState();
    if (document.getElementById('section-dashboard').classList.contains('active')) renderDashboard();
}

// ---- NOTIFICATIONS ----
function addNotification(target, title, description, type = 'info') {
    const notif = { id: notificationIdCounter++, target, title, description, type, read: false, timestamp: new Date().toISOString() };
    notifications.push(notif);
    saveState();
    updateNotificationBadge();
    renderNotifications();
}
function updateNotificationBadge() {
    const unread = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    if (badge) { badge.textContent = unread > 0 ? unread : '0'; badge.style.display = unread > 0 ? 'block' : 'none'; }
}
function renderNotifications() {
    const container = document.getElementById('notifList');
    if (!container) return;
    const userNotifs = notifications.filter(n => n.target === 'admin' || n.target === currentUser?.email || n.target === 'all');
    if (!userNotifs.length) { container.innerHTML = '<div style="padding:12px 14px; color:var(--text-muted); font-size:0.8rem; text-align:center;">No notifications</div>'; return; }
    container.innerHTML = userNotifs.slice().reverse().slice(0, 10).map(n => `<div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead(${n.id})"><div class="notif-title">${n.title}</div><div class="notif-desc">${n.description}</div><div class="notif-time">${new Date(n.timestamp).toLocaleDateString()}</div></div>`).join('');
}
function markNotifRead(id) {
    const notif = notifications.find(n => n.id === id);
    if (notif) notif.read = true;
    updateNotificationBadge();
    renderNotifications();
    saveState();
}
function toggleNotifications() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown.classList.toggle('open');
    if (dropdown.classList.contains('open')) { renderNotifications(); notifications.forEach(n => n.read = true); updateNotificationBadge(); saveState(); }
}

// ---- AUTH ----
function toggleAuthMode() {
    isSignUp = !isSignUp;
    const title = $('#authModalTitle'), sub = $('#authModalSub'), btn = $('#authSubmitBtn'), switchText = $('#authSwitchText'), switchLink = $('#authSwitchLink'), nameGroup = $('#signupNameGroup'), roleGroup = $('#signupRoleGroup');
    if (isSignUp) {
        title.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        sub.textContent = 'Join Smart Farmers today.';
        btn.textContent = 'Sign Up';
        switchText.textContent = 'Already have an account?';
        switchLink.textContent = 'Sign In';
        nameGroup.style.display = 'block';
        roleGroup.style.display = 'block';
        $('#authRole').value = 'customer';
    } else {
        title.innerHTML = '<i class="fas fa-user-circle"></i> Sign In';
        sub.textContent = 'Welcome back!';
        btn.textContent = 'Sign In';
        switchText.textContent = "Don't have an account?";
        switchLink.textContent = 'Create one';
        nameGroup.style.display = 'none';
        roleGroup.style.display = 'none';
    }
}
function handleAuth(e) {
    e.preventDefault();
    const email = $('#authEmail').value.trim(), password = $('#authPassword').value.trim(), phone = $('#authPhone').value.trim(), name = $('#authName').value.trim(), role = $('#authRole').value;
    if (!email || !password) { toast('error', 'Please fill in all required fields.'); return; }
    if (isSignUp) {
        if (!name) { toast('error', 'Please enter your full name.'); return; }
        if (!phone) { toast('error', 'Please enter your phone number.'); return; }
        const existing = users.find(u => u.email === email);
        if (existing) { toast('error', 'A user with this email already exists.'); return; }
        otpPendingUser = { name, email, phone, password, role, isNew: true };
        otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        document.getElementById('otpTarget').textContent = `${phone} and ${email}`;
        toast('info', `📱 OTP sent to ${phone} and ${email}`);
        closeModal('authModal');
        openModal('otpModal');
        document.querySelectorAll('.otp-digit').forEach(inp => inp.value = '');
        document.querySelector('.otp-digit').focus();
    } else {
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) { toast('error', 'Invalid email or password.'); return; }
        if (!user.verified) {
            toast('warning', 'Please verify your account first. OTP sent.');
            otpPendingUser = user;
            otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            document.getElementById('otpTarget').textContent = `${user.phone} and ${user.email}`;
            closeModal('authModal');
            openModal('otpModal');
            document.querySelectorAll('.otp-digit').forEach(inp => inp.value = '');
            document.querySelector('.otp-digit').focus();
            return;
        }
        currentUser = user;
        closeModal('authModal');
        toast('success', `Welcome back, ${user.name}!`);
        updateAuthUI();
        renderDashboard();
        saveState();
        checkNotifications();
        e.target.reset();
    }
}
function updateAuthUI() {
    const greeting = document.getElementById('greetingUser');
    if (currentUser) greeting.textContent = currentUser.name;
    else greeting.textContent = 'Sign in';
}
function signOut() {
    if (confirm('Are you sure you want to sign out?')) { currentUser = null; appliedCoupon = null; updateAuthUI(); renderDashboard(); saveState(); toast('info', 'Signed out.'); navigateTo('home'); }
}

// ---- OTP ----
function initOTPInputs() {
    const inputs = document.querySelectorAll('.otp-digit');
    inputs.forEach((input, idx) => {
        input.addEventListener('input', function(e) { if (this.value.length === 1 && idx < inputs.length - 1) inputs[idx + 1].focus(); });
        input.addEventListener('keydown', function(e) { if (e.key === 'Backspace' && this.value === '' && idx > 0) inputs[idx - 1].focus(); if (e.key === 'Enter') verifyOtp(); });
    });
}
function verifyOtp() {
    const inputs = document.querySelectorAll('.otp-digit');
    const entered = Array.from(inputs).map(inp => inp.value).join('');
    if (entered.length !== 6) { toast('error', 'Please enter the full 6-digit code.'); return; }
    if (entered !== otpCode) { toast('error', 'Invalid OTP. Please try again.'); return; }
    if (otpPendingUser) {
        const user = otpPendingUser;
        if (user.isNew) {
            const newUser = { id: userIdCounter++, name: user.name, email: user.email, phone: user.phone, password: user.password, role: user.role, verified: true, approved: user.role === 'customer' ? true : false };
            users.push(newUser);
            currentUser = newUser;
            if (user.role === 'vendor') { toast('info', 'Please complete your vendor registration.'); closeModal('otpModal'); openVendorSignup(); otpPendingUser = null; saveState(); return; }
            if (user.role === 'consultant') {
                pendingConsultants.push({ ...user, approved: false });
                addNotification('admin', 'New Consultant Application', `${user.name} has applied to become a consultant.`, 'warning');
                toast('info', 'Your consultant application has been submitted for admin review.');
                closeModal('otpModal');
                currentUser = newUser;
                updateAuthUI();
                saveState();
                return;
            }
            if (user.role === 'financial') {
                pendingFinancials.push({ ...user, approved: false });
                addNotification('admin', 'New Financial Institution Application', `${user.name} has applied to join as a financial partner.`, 'warning');
                toast('info', 'Your application has been submitted for admin review.');
                closeModal('otpModal');
                currentUser = newUser;
                updateAuthUI();
                saveState();
                return;
            }
            toast('success', `🎉 Welcome, ${user.name}!`);
            closeModal('otpModal');
            currentUser = newUser;
            updateAuthUI();
            renderDashboard();
            saveState();
            checkNotifications();
        } else {
            user.verified = true;
            currentUser = user;
            toast('success', 'Account verified!');
            closeModal('otpModal');
            updateAuthUI();
            renderDashboard();
            saveState();
            checkNotifications();
        }
        otpPendingUser = null;
        otpCode = '';
        document.querySelectorAll('.otp-digit').forEach(inp => inp.value = '');
    }
}
function resendOtp() {
    if (!otpPendingUser) { toast('error', 'No pending verification.'); return; }
    otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById('otpTarget').textContent = `${otpPendingUser.phone} and ${otpPendingUser.email}`;
    toast('info', `📱 New OTP sent to ${otpPendingUser.phone}`);
    document.querySelectorAll('.otp-digit').forEach(inp => inp.value = '');
    document.querySelector('.otp-digit').focus();
}

// ---- VENDOR SIGNUP ----
function openVendorSignup() {
    if (!currentUser) { toast('info', 'Please sign in first to register as a vendor.'); openModal('authModal'); return; }
    const commissionContainer = document.getElementById('vendorCommissionSetup');
    let html = '';
    for (const [cat, val] of Object.entries(globalCommissions)) { html += `<div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid var(--border-color); font-size:0.8rem;"><span>${cat}</span><div style="display:flex; align-items:center; gap:4px;"><input type="number" class="vendor-comm-input" data-cat="${cat}" value="${val}" style="width:50px; padding:2px 6px; border:1px solid var(--border-color); border-radius:4px; background:var(--input-bg); color:var(--text-primary); font-size:0.75rem;" /><span class="pct">%</span></div></div>`; }
    commissionContainer.innerHTML = html;
    openModal('vendorSignupModal');
}
function submitVendorSignup(e) {
    e.preventDefault();
    const name = document.getElementById('vendorBizName').value.trim();
    const storeName = document.getElementById('vendorStoreName').value.trim();
    const goodsTypes = Array.from(document.getElementById('vendorGoodsTypes').selectedOptions).map(opt => opt.value);
    const desc = document.getElementById('vendorBizDesc').value.trim();
    const location = document.getElementById('vendorBizLocation').value.trim();
    const phone = document.getElementById('vendorBizPhone').value.trim();
    const email = document.getElementById('vendorBizEmail').value.trim();
    if (!name || !storeName || !location || !phone || !email) { toast('error', 'Please fill in all required fields.'); return; }
    if (!goodsTypes.length) { toast('error', 'Please select at least one goods type.'); return; }
    const commInputs = document.querySelectorAll('.vendor-comm-input');
    const commissions = {};
    commInputs.forEach(inp => { commissions[inp.dataset.cat] = parseFloat(inp.value) || 0; });
    const newVendorId = 'VENDOR-' + String(1000 + pendingVendors.length + vendors.length + 1);
    const pendingVendor = { id: Date.now(), vendorId: newVendorId, name, storeName, goodsTypes, desc, location, phone, email, commissions, approved: false, earnings: 0, balance: 0, userId: currentUser.id, userName: currentUser.name, appliedAt: new Date().toISOString() };
    pendingVendors.push(pendingVendor);
    addNotification('admin', 'New Vendor Application', `${name} has applied to become a vendor.`, 'warning');
    toast('success', '🎉 Your vendor application has been submitted for admin approval!');
    closeModal('vendorSignupModal');
    if (currentUser.role !== 'vendor') { currentUser.role = 'vendor'; currentUser.approved = false; saveState(); }
    renderDashboard();
    updateAuthUI();
}

// ---- DELIVERY REGISTRATION ----
function submitDeliveryRegistration(e) {
    e.preventDefault();
    const fullName = document.getElementById('deliveryName').value.trim();
    const phone = document.getElementById('deliveryPhone').value.trim();
    const email = document.getElementById('deliveryEmail').value.trim();
    const vehicleType = document.getElementById('deliveryVehicleType').value;
    const vehicleModel = document.getElementById('deliveryVehicleModel').value.trim();
    const licenseNumber = document.getElementById('deliveryLicense').value.trim();
    const permitNumber = document.getElementById('deliveryPermit').value.trim();
    const nationalId = document.getElementById('deliveryNationalId').value.trim();
    if (!fullName || !phone || !email || !vehicleType || !licenseNumber || !permitNumber || !nationalId) { toast('error', 'Please fill in all required fields.'); return; }
    const prefix = { 'Motorcycle':'MC','Car':'CAR','Van':'VAN','Truck':'TRK','Bicycle':'BIC','Boda':'BODA' }[vehicleType] || 'DLV';
    const count = pendingDeliveryPersons.length + deliveryPersons.length + 1;
    const uniqueId = `${prefix}-${String(count).padStart(4, '0')}`;
    const pendingDelivery = { id: Date.now(), uniqueId, fullName, phone, email, vehicleType, vehicleModel: vehicleModel || 'N/A', licenseNumber, permitNumber, nationalId, photo: '', status: 'pending', userId: currentUser.id, joinedAt: new Date().toISOString() };
    pendingDeliveryPersons.push(pendingDelivery);
    addNotification('admin', 'New Delivery Registration', `${fullName} has registered as a delivery person (${uniqueId}).`, 'warning');
    toast('success', `✅ Registration submitted! Your Delivery ID: ${uniqueId}.`);
    closeModal('deliveryRegModal');
    document.getElementById('deliveryRegForm').reset();
    saveState();
}

// ---- COUPON ----
function applyCoupon() {
    const code = document.getElementById('couponInput').value.trim().toUpperCase();
    if (!code) { toast('error', 'Please enter a coupon code.'); return; }
    const coupon = coupons.find(c => c.code === code && c.active !== false);
    if (!coupon) { toast('error', 'Invalid or expired coupon code.'); return; }
    if (coupon.expiry && new Date(coupon.expiry) < new Date()) { toast('error', 'This coupon has expired.'); return; }
    appliedCoupon = coupon;
    document.getElementById('couponMessage').innerHTML = `<span style="color:var(--success);">✅ Coupon applied! ${coupon.type === 'percentage' ? coupon.value+'% off' : currency.symbol+' '+(coupon.value*currency.rate).toLocaleString()+' off'}</span>`;
    toast('success', `Coupon "${code}" applied!`);
    renderCheckout();
}

// ---- LOCATION ----
function getLocation() {
    if (!navigator.geolocation) { toast('error', 'Geolocation not supported.'); return; }
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
                .then(res => res.json())
                .then(data => {
                    const addr = data.display_name || 'Your location';
                    document.getElementById('checkoutLine').textContent = addr;
                    const place = document.querySelector('.delivery-place');
                    if (place) {
                        const parts = addr.split(',').map(s => s.trim());
                        const city = parts[0] || 'Online';
                        const region = parts[parts.length - 1] || 'Uganda';
                        place.textContent = city;
                        const regionEl = document.querySelector('.delivery-region');
                        if (regionEl) regionEl.textContent = region;
                    }
                    toast('success', '📍 Location updated!');
                })
                .catch(() => {
                    document.getElementById('checkoutLine').textContent = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
                    toast('info', 'Location detected (approx)');
                });
        },
        error => { toast('error', 'Unable to get location. Please enter manually.'); },
        { enableHighAccuracy: true }
    );
}

// ---- CHECKOUT ----
function renderCheckout() {
    const itemsContainer = document.getElementById('checkoutItems');
    const totalsContainer = document.getElementById('checkoutTotals');
    if (!cart.length) { itemsContainer.innerHTML = '<p>Your cart is empty.</p>'; totalsContainer.innerHTML = ''; return; }
    const grouped = {};
    cart.forEach(item => {
        const vendor = vendors.find(v => v.id === item.vendorId);
        const key = vendor ? vendor.storeName : 'Unknown';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
    });
    let html = '', totalUSD = 0;
    Object.keys(grouped).forEach(store => {
        const items = grouped[store];
        const subTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
        totalUSD += subTotal;
        html += `<div style="background:var(--bg-body); padding:8px; border-radius:var(--radius); margin-bottom:8px;"><strong>${store}</strong>${items.map(item => `<div style="display:flex; justify-content:space-between; font-size:0.85rem; padding:2px 0;"><span>${item.name}${item.variation ? ' ('+item.variation+')' : ''} x${item.qty}</span><span>${formatPrice(item.price * item.qty)}</span></div>`).join('')}<div style="text-align:right; font-weight:700; border-top:1px solid var(--border-color); padding-top:4px;">Subtotal: ${formatPrice(subTotal)}</div></div>`;
    });
    let discountUSD = 0, discountLabel = '';
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') { discountUSD = totalUSD * (appliedCoupon.value / 100); discountLabel = `${appliedCoupon.value}% off`; }
        else { discountUSD = appliedCoupon.value; discountLabel = `${currency.symbol} ${(discountUSD * currency.rate).toLocaleString()} off`; }
        if (discountUSD > totalUSD) discountUSD = totalUSD;
    }
    const totalAfterDiscount = totalUSD - discountUSD;
    const shipping = 5000 / currency.rate;
    const tax = totalAfterDiscount * 0.08;
    const grandTotal = totalAfterDiscount + shipping + tax;
    const totalLocal = totalUSD * currency.rate;
    const discountLocal = discountUSD * currency.rate;
    itemsContainer.innerHTML = html;
    totalsContainer.innerHTML = `
        <div class="total-row"><span>Items (${cart.length})</span><span class="value">${formatPrice(totalUSD)}</span></div>
        ${appliedCoupon ? `<div class="total-row" style="color:var(--success);"><span>Discount (${discountLabel})</span><span class="value">-${formatPrice(discountUSD)}</span></div>` : ''}
        <div class="total-row"><span>Shipping</span><span class="value">${formatPrice(shipping)}</span></div>
        <div class="total-row"><span>Tax</span><span class="value">${formatPrice(tax)}</span></div>
        <div class="total-row grand-total"><span>Grand Total</span><span class="value">${formatPrice(grandTotal)}</span></div>
    `;
    window._checkoutTotalUSD = grandTotal;
}

// ---- PAYMENT ----
function openFlutterwaveModal() {
    if (!cart.length) { toast('error', 'Cart is empty.'); return; }
    if (!currentUser) { toast('info', 'Please sign in.'); openModal('authModal'); return; }
    openModal('flutterwaveModal');
    const totalUSD = window._checkoutTotalUSD || cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    document.querySelector('#flutterwaveModal .btn-pay').innerHTML = `<i class="fas fa-lock"></i> Pay ${formatPrice(totalUSD)}`;
}
function selectPayMethod(el, method) {
    document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('mobileForm').style.display = method === 'mobile' ? 'block' : 'none';
    document.getElementById('bankForm').style.display = method === 'bank' ? 'block' : 'none';
    document.getElementById('cardForm').style.display = method === 'card' ? 'block' : 'none';
}
function processPayment() {
    const active = document.querySelector('.pay-option.active');
    const method = active ? active.dataset.method : 'mobile';
    let valid = true;
    if (method === 'mobile') { const phone = document.getElementById('mobilePhone').value.trim(); if (!phone) { toast('error', 'Please enter your phone number.'); valid = false; } }
    else if (method === 'bank') { const acc = document.getElementById('bankAccount').value.trim(); if (!acc) { toast('error', 'Please enter your bank account number.'); valid = false; } }
    else if (method === 'card') { const num = document.getElementById('cardNumber').value.replace(/\s/g, ''); const exp = document.getElementById('cardExpiry').value; const cvv = document.getElementById('cardCvv').value; if (num.length < 15 || !exp || !cvv) { toast('error', 'Please fill in all card details.'); valid = false; } }
    if (!valid) return;
    const totalUSD = window._checkoutTotalUSD || cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    toast('info', '⏳ Processing payment...');
    setTimeout(() => {
        toast('success', `✅ Payment of ${formatPrice(totalUSD)} successful using ${method.toUpperCase()}!`);
        closeModal('flutterwaveModal');
        const order = { id: orderIdCounter++, items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price, variation: i.variation || '' })), totalUSD, customerName: currentUser.name, customerEmail: currentUser.email, vendorIds: [...new Set(cart.map(i => i.vendorId))], vendorName: cart[0]?.seller || 'Vendor', category: cart[0]?.category || 'General', status: 'pending', date: new Date().toISOString() };
        orders.push(order);
        cart = [];
        appliedCoupon = null;
        updateCartUI();
        saveState();
        renderDashboard();
        document.getElementById('mobilePhone').value = '';
        document.getElementById('bankAccount').value = '';
        document.getElementById('cardNumber').value = '';
        document.getElementById('cardExpiry').value = '';
        document.getElementById('cardCvv').value = '';
        document.getElementById('cardName').value = '';
        toast('success', '🎉 Order placed successfully!');
        navigateTo('dashboard');
    }, 1500);
}

// ---- DASHBOARD (delegates to role-specific functions) ----
function renderDashboard() {
    if (!currentUser) {
        document.getElementById('dashUserName').textContent = 'Guest';
        document.getElementById('dashUserRole').textContent = 'Customer';
        document.getElementById('dashStatusBadge').innerHTML = '';
        document.getElementById('dashNavItems').innerHTML = `<div class="dash-nav-item active" onclick="toast('info', 'Please sign in to access your dashboard.')"><i class="fas fa-sign-in-alt"></i> Sign In</div>`;
        document.getElementById('dashContent').innerHTML = `<div style="text-align:center; padding:40px 0; color:var(--text-muted);"><i class="fas fa-lock" style="font-size:3rem; display:block; margin-bottom:12px;"></i><h3>Please Sign In</h3><p>Sign in to access your dashboard.</p><button class="btn-primary" style="margin-top:12px; padding:8px 24px; background:var(--primary); color:#111; border-radius:6px; font-weight:600;" onclick="openModal('authModal')">Sign In</button></div>`;
        return;
    }
    const role = currentUser.role || 'customer';
    document.getElementById('dashUserName').textContent = currentUser.name;
    document.getElementById('dashUserRole').textContent = role.charAt(0).toUpperCase() + role.slice(1);
    // Check for vendor pending approval
    if (role === 'vendor') {
        const pending = pendingVendors.find(v => v.email === currentUser.email);
        if (pending && !pending.approved) {
            document.getElementById('dashStatusBadge').innerHTML = `<span class="status-badge pending">⏳ Waiting for Admin Approval</span>`;
            document.getElementById('dashRoleBadge').textContent = 'Pending Approval';
            document.getElementById('dashNavItems').innerHTML = '';
            document.getElementById('dashContent').innerHTML = `<div style="text-align:center; padding:40px 0;"><i class="fas fa-clock" style="font-size:4rem; color:var(--primary);"></i><h3 style="margin:16px 0;">Your vendor application is under review</h3><p style="color:var(--text-muted);">You'll be notified once the admin approves your account.</p><div style="margin-top:20px; background:var(--bg-body); padding:16px; border-radius:var(--radius); display:inline-block;"><p><strong>Vendor ID:</strong> ${pending.vendorId || 'N/A'}</p><p><strong>Store:</strong> ${pending.storeName}</p></div><button class="btn-sm danger" style="margin-top:20px;" onclick="signOut()">Sign Out</button></div>`;
            return;
        }
    }
    // Check for consultant pending
    if (role === 'consultant') {
        const pending = pendingConsultants.find(c => c.email === currentUser.email);
        if (pending && !pending.approved) {
            document.getElementById('dashStatusBadge').innerHTML = `<span class="status-badge pending">⏳ Waiting for Admin Approval</span>`;
            document.getElementById('dashRoleBadge').textContent = 'Pending Approval';
            document.getElementById('dashNavItems').innerHTML = '';
            document.getElementById('dashContent').innerHTML = `<div style="text-align:center; padding:40px 0;"><i class="fas fa-clock" style="font-size:4rem; color:var(--primary);"></i><h3 style="margin:16px 0;">Your consultant application is under review</h3><p style="color:var(--text-muted);">You'll be notified once the admin approves your account.</p><button class="btn-sm danger" style="margin-top:20px;" onclick="signOut()">Sign Out</button></div>`;
            return;
        }
    }
    // Check for financial pending
    if (role === 'financial') {
        const pending = pendingFinancials.find(f => f.email === currentUser.email);
        if (pending && !pending.approved) {
            document.getElementById('dashStatusBadge').innerHTML = `<span class="status-badge pending">⏳ Waiting for Admin Approval</span>`;
            document.getElementById('dashRoleBadge').textContent = 'Pending Approval';
            document.getElementById('dashNavItems').innerHTML = '';
            document.getElementById('dashContent').innerHTML = `<div style="text-align:center; padding:40px 0;"><i class="fas fa-clock" style="font-size:4rem; color:var(--primary);"></i><h3 style="margin:16px 0;">Your financial institution application is under review</h3><p style="color:var(--text-muted);">You'll be notified once the admin approves your account.</p><button class="btn-sm danger" style="margin-top:20px;" onclick="signOut()">Sign Out</button></div>`;
            return;
        }
    }
    // Delivery pending
    if (role === 'delivery') {
        const pending = pendingDeliveryPersons.find(d => d.email === currentUser.email);
        if (pending && pending.status === 'pending') {
            document.getElementById('dashStatusBadge').innerHTML = `<span class="status-badge pending">⏳ Waiting for Admin Approval</span>`;
            document.getElementById('dashRoleBadge').textContent = 'Pending Approval';
            document.getElementById('dashNavItems').innerHTML = '';
            document.getElementById('dashContent').innerHTML = `<div style="text-align:center; padding:40px 0;"><i class="fas fa-clock" style="font-size:4rem; color:var(--primary);"></i><h3 style="margin:16px 0;">Your delivery registration is under review</h3><p style="color:var(--text-muted);">You'll be notified once the admin approves your account.</p><div style="margin-top:20px; background:var(--bg-body); padding:16px; border-radius:var(--radius); display:inline-block;"><p><strong>Delivery ID:</strong> ${pending.uniqueId}</p><p><strong>Vehicle:</strong> ${pending.vehicleType}</p></div><button class="btn-sm danger" style="margin-top:20px;" onclick="signOut()">Sign Out</button></div>`;
            return;
        }
    }
    // Set status badge
    let statusHtml = '';
    if (role === 'vendor') {
        const vendor = vendors.find(v => v.email === currentUser.email);
        if (vendor) statusHtml = `<span class="status-badge approved">✓ Approved</span>`;
        else statusHtml = `<span class="status-badge pending">⏳ Not Registered</span>`;
    } else if (role === 'consultant') {
        const consultant = consultants.find(c => c.email === currentUser.email);
        if (consultant) statusHtml = `<span class="status-badge approved">✓ Approved</span>`;
        else statusHtml = `<span class="status-badge pending">⏳ Not Registered</span>`;
    } else if (role === 'financial') {
        const financial = financialInstitutions.find(f => f.email === currentUser.email);
        if (financial) statusHtml = `<span class="status-badge approved">✓ Active</span>`;
        else statusHtml = `<span class="status-badge pending">⏳ Not Registered</span>`;
    } else if (role === 'admin') {
        statusHtml = `<span class="status-badge approved">👑 Admin</span>`;
    } else {
        statusHtml = `<span class="status-badge approved">✓ Active</span>`;
    }
    document.getElementById('dashStatusBadge').innerHTML = statusHtml;
    document.getElementById('dashRoleBadge').textContent = role.charAt(0).toUpperCase() + role.slice(1) + ' Dashboard';
    // Delegate to role-specific functions
    if (role === 'admin') renderAdminDashboard();
    else if (role === 'vendor') renderVendorDashboard();
    else if (role === 'consultant') renderConsultantDashboard();
    else if (role === 'financial') renderFinancialDashboard();
    else if (role === 'delivery') renderDeliveryDashboard();
    else renderCustomerDashboard();
}
function switchDashTab(tabId) { dashboardActiveTab = tabId; renderDashboard(); }

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function() {
    detectCurrency();
    renderCategories();
    renderSideMenu();
    renderBanners();
    renderHomeProducts();
    renderTopSellers();
    renderConsultantMini();
    renderFinanceMini();
    renderConsultantsFull();
    renderFinanceFull();
    updateCartUI();
    loadState();
    applyTheme();
    initOTPInputs();
    renderAdvertFeed();
    // Flash sales, deals, featured, etc.
    renderFlashSales();
    renderDeals();
    renderBestSellersByCategory();
    renderFeaturedProducts();
    renderSecondaryNav();
    startBannerAutoSlide();
    setInterval(updateFlashTimer, 1000);
    updateFlashTimer();

    $('#authSwitchLink').addEventListener('click', toggleAuthMode);

    document.addEventListener('click', function(e) {
        const card = e.target.closest('.product-card');
        if (card && !e.target.closest('.btn-add')) {
            const id = parseInt(card.dataset.id);
            if (id) showProductDetail(id);
        }
    });

    if (document.getElementById('section-dashboard').classList.contains('active')) renderDashboard();
});

// ---- CURRENCY ----
function detectCurrency() {
    const locale = navigator.language || 'en-US';
    const region = locale.split('-')[1] || 'UG';
    const map = { 'UG':{code:'UGX',symbol:'USh',rate:3700}, 'KE':{code:'KES',symbol:'KSh',rate:130}, 'TZ':{code:'TZS',symbol:'TSh',rate:2500}, 'NG':{code:'NGN',symbol:'₦',rate:1500}, 'GH':{code:'GHS',symbol:'₵',rate:12}, 'ZA':{code:'ZAR',symbol:'R',rate:18}, 'US':{code:'USD',symbol:'$',rate:1}, 'GB':{code:'GBP',symbol:'£',rate:0.8} };
    currency = map[region] || map['UG'];
    $('#currencyDisplay').textContent = `${currency.symbol} ${currency.code}`;
    $('#footerCurrency').textContent = currency.code;
    $('#exchangeRate').textContent = currency.rate.toLocaleString();
}

// ---- FLASH SALES ----
let flashSales = { active: true, endTime: new Date(Date.now() + 3600000 * 2), products: [1,4,7,10] };
let dealProducts = [2,5,8,11];
function renderFlashSales() {
    const container = document.getElementById('flashProductGrid');
    if (!flashSales.active) { container.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted);">No active flash sales</p>'; return; }
    const flashProducts = products.filter(p => flashSales.products.includes(p.id));
    if (!flashProducts.length) { container.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted);">No flash products</p>'; return; }
    container.innerHTML = flashProducts.map(p => createProductCard(p)).join('');
}
function renderDeals() {
    const grid = document.getElementById('dealsProductGrid');
    const dealProductsList = products.filter(p => dealProducts.includes(p.id));
    if (!dealProductsList.length) { grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted);">No deals today</p>'; return; }
    grid.innerHTML = dealProductsList.map(p => createProductCard(p)).join('');
}
function renderBestSellersByCategory() {
    const container = document.getElementById('bestSellersByCategory');
    const categories = Object.keys(categoryData);
    let html = '';
    categories.forEach(cat => {
        const catProducts = products.filter(p => p.category === cat).slice(0, 4);
        if (!catProducts.length) return;
        html += `<div class="category-best-sellers"><div class="category-header"><h3>🏅 Best Sellers in ${cat}</h3><a onclick="navigateTo('marketplace'); filterCategory('${cat.toLowerCase()}')">See all →</a></div><div class="product-grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));">${catProducts.map(p => createProductCard(p)).join('')}</div></div>`;
    });
    container.innerHTML = html;
}
function renderFeaturedProducts() {
    const grid = document.getElementById('featuredProductGrid');
    const featured = products.filter(p => p.featured === true);
    if (!featured.length) { grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted);">No featured products</p>'; return; }
    grid.innerHTML = featured.map(p => createProductCard(p)).join('');
}
function updateFlashTimer() {
    const now = new Date();
    const end = new Date(flashSales.endTime);
    const diff = Math.max(0, end - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    document.getElementById('flashDays').textContent = String(days).padStart(2, '0');
    document.getElementById('flashHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('flashMins').textContent = String(mins).padStart(2, '0');
    document.getElementById('flashSecs').textContent = String(secs).padStart(2, '0');
    if (diff <= 0) { flashSales.active = false; document.querySelector('.flash-sales .countdown-timer').innerHTML = '🎉 Ended'; }
}
function renderSecondaryNav() {
    const container = document.getElementById('categoryLinks');
    const categories = Object.keys(categoryData);
    container.innerHTML = categories.map(cat => `<a onclick="navigateTo('marketplace'); filterCategory('${cat.toLowerCase()}')">${cat}</a>`).join('');
}

// ---- SERVICES ----
const services = [
    { id: 'alexa', name: 'Alexa for Shopping', icon: 'fa-microphone', description: 'Shop hands-free with Alexa.', color: '#00BFFF', variations: [{type:'grid',title:'Voice Shopping',items:['Add to cart by voice','Track orders']}] },
    { id: 'prime', name: 'Prime Video', icon: 'fa-video', description: 'Stream thousands of movies.', color: '#FF9900', variations: [{type:'grid',title:'Watch Now',items:['New Releases','TV Shows']}] },
    { id: 'online', name: "Online's Amazon.com", icon: 'fa-globe', description: 'Your personalized experience.', color: '#FF6B6B', variations: [{type:'list',title:'Quick Links',items:['Your Orders','Your Lists']}] },
    { id: 'coupons', name: 'Coupons', icon: 'fa-ticket-alt', description: 'Save money with coupons.', color: '#4CAF50', variations: [{type:'grid',title:'Active Coupons',items:['10% off Seeds','Free Shipping']}] },
    { id: 'customer-service', name: 'Customer Service', icon: 'fa-headset', description: 'Get help with orders.', color: '#FF9800', variations: [{type:'list',title:'Help Topics',items:['Order Issues','Returns']}] },
    { id: 'browsing', name: 'Browsing History', icon: 'fa-history', description: 'View your history.', color: '#9C27B0', variations: [{type:'grid',title:'Recent Views',items:['Maize Seeds','Fertilizer']}] },
    { id: 'deals', name: "Today's Deals", icon: 'fa-bolt', description: 'Limited-time offers.', color: '#F44336', variations: [{type:'grid',title:'Deals of the Day',items:['50% off Seeds']}] },
    { id: 'registry', name: 'Registry', icon: 'fa-gift', description: 'Create gift registries.', color: '#E91E63', variations: [{type:'grid',title:'Registry Types',items:['Wedding','Baby']}] },
    { id: 'buy-again', name: 'Buy Again', icon: 'fa-redo', description: 'Reorder favorites.', color: '#2196F3', variations: [{type:'grid',title:'Recent Orders',items:['Maize Seed 5kg']}] },
    { id: 'gift-cards', name: 'Gift Cards', icon: 'fa-gift', description: 'Send gift cards.', color: '#FF5722', variations: [{type:'grid',title:'Gift Card Amounts',items:['$10','$25']}] },
    { id: 'sell', name: 'Sell', icon: 'fa-store', description: 'Become a seller.', color: '#FF9900', variations: [{type:'grid',title:'Sell On SmartFarmers',items:['Register as Vendor']}] }
];
function navigateToService(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (!service) { toast('error', 'Service not found.'); return; }
    navigateTo('service');
    const container = document.getElementById('serviceContent');
    let variationsHtml = '';
    service.variations.forEach(v => {
        if (v.type === 'grid') {
            variationsHtml += `<div class="service-variation service-grid"><h3>${v.title}</h3><div class="service-grid-items">${v.items.map(item => `<div class="service-grid-item"><i class="fas fa-star"></i> ${item}</div>`).join('')}</div></div>`;
        } else if (v.type === 'list') {
            variationsHtml += `<div class="service-variation service-list"><h3>${v.title}</h3><ul class="service-list-items">${v.items.map(item => `<li><i class="fas fa-check"></i> ${item}</li>`).join('')}</ul></div>`;
        } else if (v.type === 'featured') {
            variationsHtml += `<div class="service-variation service-featured"><h3>${v.title}</h3><div class="service-featured-items">${v.items.map(item => `<div class="service-featured-item"><i class="fas fa-crown"></i> ${item}</div>`).join('')}</div></div>`;
        }
    });
    container.innerHTML = `<div class="service-page"><div class="service-header"><div class="service-icon" style="background:${service.color}20; color:${service.color};"><i class="fas ${service.icon}"></i></div><div><h1 class="service-title">${service.name}</h1><p class="service-description">${service.description}</p></div></div><div class="service-variations">${variationsHtml}</div><div class="service-actions"><button class="btn-primary" onclick="navigateTo('home')" style="background:var(--primary); color:#111; border-radius:6px; padding:10px 24px; font-weight:600;"><i class="fas fa-home"></i> Return Home</button></div></div>`;
}
function renderServiceSections() {
    const homeSection = document.getElementById('section-home');
    let servicesContainer = document.getElementById('servicesShowcase');
    if (!servicesContainer) { servicesContainer = document.createElement('div'); servicesContainer.id = 'servicesShowcase'; servicesContainer.className = 'services-showcase'; const consultantsShowcase = document.querySelector('.consultant-showcase'); if (consultantsShowcase) consultantsShowcase.parentNode.insertBefore(servicesContainer, consultantsShowcase); else homeSection.appendChild(servicesContainer); }
    let html = `<div class="section-header"><h2><i class="fas fa-th-list" style="color:var(--primary);"></i> All Services</h2><p style="color:var(--text-muted);">Explore everything Smart Farmers has to offer</p></div><div class="services-grid">`;
    services.forEach(service => {
        html += `<div class="service-card" onclick="navigateToService('${service.id}')" style="border-top: 4px solid ${service.color};"><div class="service-card-icon" style="color:${service.color};"><i class="fas ${service.icon}"></i></div><h3>${service.name}</h3><p>${service.description}</p><span class="service-card-link">Explore →</span></div>`;
    });
    html += `</div>`;
    servicesContainer.innerHTML = html;
}

// ---- DELIVERY TRACKING MAP ----
function renderDeliveryTrackingMap(orderId) {
    const container = document.getElementById('trackingMapContainer');
    if (!container) return;
    const request = deliveryRequests.find(r => r.orderId === orderId);
    if (!request) { container.innerHTML = '<p>No delivery assigned yet.</p>'; return; }
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const deliveryPerson = deliveryPersons.find(d => d.id === request.deliveryPersonId);
    if (!deliveryPerson) { container.innerHTML = '<p>Delivery person not found.</p>'; return; }
    const currentLat = request.currentLat || request.vendorLat || 0.3136;
    const currentLng = request.currentLng || request.vendorLng || 32.5811;
    const destLat = request.customerLat || 0.3136;
    const destLng = request.customerLng || 32.5811;
    container.innerHTML = `<div class="tracking-card"><div class="tracking-header"><div class="delivery-info"><h4>Delivery Status: <span class="text-${request.status === 'delivered' ? 'success' : 'warning'}">${request.status}</span></h4><p><strong>Delivery Person:</strong> ${deliveryPerson.fullName}</p><p><strong>Vehicle:</strong> ${deliveryPerson.vehicleType} ${deliveryPerson.vehicleModel}</p><p><strong>License:</strong> ${deliveryPerson.licenseNumber}</p><p><strong>Phone:</strong> <a href="tel:${deliveryPerson.phone}">${deliveryPerson.phone}</a></p><p><strong>Delivery ID:</strong> ${deliveryPerson.uniqueId}</p></div><div class="delivery-actions"><button class="btn-sm primary" onclick="callDelivery(${deliveryPerson.id})"><i class="fas fa-phone"></i> Call</button><button class="btn-sm primary" onclick="whatsappDelivery(${deliveryPerson.id})"><i class="fab fa-whatsapp"></i> WhatsApp</button></div></div><div class="tracking-map" id="trackingMap" style="height:300px; background:var(--bg-body); border-radius:var(--radius); position:relative;"><div id="mapPlaceholder" style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--text-muted);"><i class="fas fa-map-marker-alt" style="font-size:2rem; margin-right:8px;"></i>Loading map...</div></div><div class="tracking-footer"><p><i class="fas fa-location-dot"></i> Current location: ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}</p><p><i class="fas fa-flag-checkered"></i> Destination: ${destLat.toFixed(4)}, ${destLng.toFixed(4)}</p><p><i class="fas fa-clock"></i> Last update: ${request.lastUpdate ? new Date(request.lastUpdate).toLocaleTimeString() : 'Just now'}</p></div></div>`;
    setTimeout(() => { initLeafletMap(orderId); }, 100);
}
function initLeafletMap(orderId) {
    if (typeof L === 'undefined') { const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link); const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload = function() { initLeafletMap(orderId); }; document.head.appendChild(script); return; }
    const request = deliveryRequests.find(r => r.orderId === orderId);
    if (!request) return;
    const mapContainer = document.getElementById('trackingMap');
    if (!mapContainer) return;
    const placeholder = document.getElementById('mapPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    const currentLat = request.currentLat || request.vendorLat || 0.3136;
    const currentLng = request.currentLng || request.vendorLng || 32.5811;
    const destLat = request.customerLat || 0.3136;
    const destLng = request.customerLng || 32.5811;
    const map = L.map('trackingMap').setView([currentLat, currentLng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
    const deliveryIcon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize: [25,41], iconAnchor: [12,41] });
    const deliveryMarker = L.marker([currentLat, currentLng], {icon: deliveryIcon}).addTo(map).bindPopup('Delivery Person: ' + (deliveryPersons.find(d => d.id === request.deliveryPersonId)?.fullName || 'N/A'));
    const destIcon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize: [25,41], iconAnchor: [12,41] });
    const destMarker = L.marker([destLat, destLng], {icon: destIcon}).addTo(map).bindPopup('Customer Delivery Location');
    const routeLine = L.polyline([[currentLat, currentLng], [destLat, destLng]], { color: '#FF9900', weight: 3, dashArray: '5, 10' }).addTo(map);
    const bounds = L.latLngBounds([currentLat, currentLng], [destLat, destLng]);
    map.fitBounds(bounds, {padding: [50,50]});
    window._deliveryMap = map; window._deliveryMarker = deliveryMarker; window._deliveryRoute = routeLine; window._trackingOrderId = orderId;
}
function updateDeliveryLocation(requestId, lat, lng) {
    const request = deliveryRequests.find(r => r.id === requestId);
    if (!request) return;
    request.currentLat = lat; request.currentLng = lng; request.lastUpdate = new Date().toISOString(); saveState();
    if (window._deliveryMarker && window._trackingOrderId === request.orderId) {
        window._deliveryMarker.setLatLng([lat, lng]);
        const destLat = request.customerLat || 0.3136; const destLng = request.customerLng || 32.5811;
        window._deliveryRoute.setLatLngs([[lat, lng], [destLat, destLng]]);
        window._deliveryMap.setView([lat, lng], 13);
    }
    const order = orders.find(o => o.id === request.orderId);
    if (order) addNotification(order.customerEmail, 'Delivery Location Updated', 'Your delivery person is at ' + lat.toFixed(4) + ', ' + lng.toFixed(4), 'info');
}
function callDelivery(deliveryPersonId) {
    const delivery = deliveryPersons.find(d => d.id === deliveryPersonId);
    if (!delivery) { toast('error', 'Delivery person not found.'); return; }
    window.location.href = `tel:${delivery.phone}`;
}
function whatsappDelivery(deliveryPersonId) {
    const delivery = deliveryPersons.find(d => d.id === deliveryPersonId);
    if (!delivery) { toast('error', 'Delivery person not found.'); return; }
    const message = `Hello, I'm tracking my order. Are you on your way?`;
    const url = `https://wa.me/${delivery.phone.replace(/^\+/, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ---- EXPOSE GLOBAL FUNCTIONS ----
window.navigateTo = navigateTo;
window.toggleSideMenu = toggleSideMenu;
window.toggleTheme = toggleTheme;
window.performSearch = performSearch;
window.filterProducts = filterProducts;
window.filterCategory = filterCategory;
window.moveBanner = moveBanner;
window.addToCart = addToCart;
window.toggleCart = toggleCart;
window.checkout = checkout;
window.openModal = openModal;
window.closeModal = closeModal;
window.toast = toast;
window.formatPrice = formatPrice;
window.handleAuth = handleAuth;
window.verifyOtp = verifyOtp;
window.resendOtp = resendOtp;
window.openVendorSignup = openVendorSignup;
window.submitVendorSignup = submitVendorSignup;
window.submitDeliveryRegistration = submitDeliveryRegistration;
window.openConsultationForm = openConsultationForm;
window.submitConsultationRequest = submitConsultationRequest;
window.applyCoupon = applyCoupon;
window.getLocation = getLocation;
window.openFlutterwaveModal = openFlutterwaveModal;
window.processPayment = processPayment;
window.selectPayMethod = selectPayMethod;
window.renderDashboard = renderDashboard;
window.switchDashTab = switchDashTab;
window.navigateToService = navigateToService;
window.renderDeliveryTrackingMap = renderDeliveryTrackingMap;
window.updateDeliveryLocation = updateDeliveryLocation;
window.callDelivery = callDelivery;
window.whatsappDelivery = whatsappDelivery;
window.signOut = signOut;
window.selectVariation = selectVariation;
window.showProductDetail = showProductDetail;