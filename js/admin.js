// ============================================================
// ADMIN DASHBOARD
// ============================================================

function renderAdminDashboard() {
    const container = document.getElementById('dashContent');
    const navItems = [
        { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
        { id: 'categories', label: 'Categories', icon: 'fa-tags' },
        { id: 'brands', label: 'Brands', icon: 'fa-tag' },
        { id: 'tags', label: 'Tags', icon: 'fa-hashtag' },
        { id: 'commissions', label: 'Commission', icon: 'fa-percent' },
        { id: 'vendors', label: 'Vendors', icon: 'fa-store' },
        { id: 'pending-vendors', label: 'Pending Vendors', icon: 'fa-clock' },
        { id: 'products', label: 'All Products', icon: 'fa-boxes' },
        { id: 'orders', label: 'Orders', icon: 'fa-shopping-bag' },
        { id: 'withdrawals', label: 'Withdrawals', icon: 'fa-money-bill-wave' },
        { id: 'coupons', label: 'Coupons', icon: 'fa-ticket-alt' },
        { id: 'banners', label: 'Banners', icon: 'fa-images' },
        { id: 'payments', label: 'Payment Settings', icon: 'fa-university' },
        { id: 'profile', label: 'Profile', icon: 'fa-user' }
    ];
    const navContainer = document.getElementById('dashNavItems');
    navContainer.innerHTML = navItems.map(item => `
        <div class="dash-nav-item ${dashboardActiveTab === item.id ? 'active' : ''}" onclick="switchDashTab('${item.id}')">
            <i class="fas ${item.icon}"></i> ${item.label}
        </div>
    `).join('');
    switch (dashboardActiveTab) {
        case 'overview': renderAdminOverview(container); break;
        case 'categories': renderAdminCategories(container); break;
        case 'brands': renderAdminBrands(container); break;
        case 'tags': renderAdminTags(container); break;
        case 'commissions': renderAdminCommissions(container); break;
        case 'vendors': renderAdminVendors(container); break;
        case 'pending-vendors': renderAdminPendingVendors(container); break;
        case 'products': renderAdminProducts(container); break;
        case 'orders': renderAdminOrders(container); break;
        case 'withdrawals': renderAdminWithdrawals(container); break;
        case 'coupons': renderAdminCoupons(container); break;
        case 'banners': renderAdminBanners(container); break;
        case 'payments': renderAdminPayments(container); break;
        case 'profile': renderAdminProfile(container); break;
        default: renderAdminOverview(container);
    }
}

// ---- OVERVIEW ----
function renderAdminOverview(container) {
    const totalVendors = vendors.length, totalProducts = products.length, totalOrders = orders.length, pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalUSD, 0);
    // best selling
    const productSales = {};
    orders.forEach(o => { o.items?.forEach(item => { const key = item.name; productSales[key] = (productSales[key] || 0) + item.qty; }); });
    const sorted = Object.entries(productSales).sort((a,b) => b[1] - a[1]).slice(0,5);
    let bestSellersHtml = sorted.length ? sorted.map(([name, qty]) => `<li style="padding:4px 0; border-bottom:1px solid var(--border-color);">${name} - ${qty} units sold</li>`).join('') : '<li>No sales data yet</li>';
    const recentReviews = [ { product:'Maize Seed', rating:5, comment:'Excellent quality!' }, { product:'Fertilizer', rating:4, comment:'Good product' } ];
    let reviewsHtml = recentReviews.map(r => `<li style="padding:4px 0; border-bottom:1px solid var(--border-color);">${r.product} - ${'★'.repeat(r.rating)} - ${r.comment}</li>`).join('');
    container.innerHTML = `
        <div class="dash-stats">
            <div class="stat-box"><div class="num">${totalVendors}</div><div class="label">Vendors</div></div>
            <div class="stat-box"><div class="num">${totalProducts}</div><div class="label">Products</div></div>
            <div class="stat-box"><div class="num">${totalOrders}</div><div class="label">Orders</div></div>
            <div class="stat-box"><div class="num">${pendingWithdrawals}</div><div class="label">Pending Withdrawals</div></div>
            <div class="stat-box"><div class="num">${formatPrice(totalRevenue)}</div><div class="label">Total Revenue</div></div>
            <div class="stat-box"><div class="num">${pendingVendors.length}</div><div class="label">Pending Vendors</div></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:16px;">
            <div><h4 style="margin-bottom:8px;">🏆 Best Selling Products</h4><ul style="list-style:none; padding:0;">${bestSellersHtml}</ul></div>
            <div><h4 style="margin-bottom:8px;">💬 Customer Recommendations</h4><ul style="list-style:none; padding:0;">${reviewsHtml}</ul></div>
        </div>
        <h4 style="margin:12px 0 8px;">Recent Orders</h4>
        ${orders.length ? `<table><thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>${orders.slice(-5).reverse().map(o => `<tr><td>#${o.id}</td><td>${o.customerName}</td><td>${o.items.length}</td><td>${formatPrice(o.totalUSD)}</td><td><span class="${o.status === 'delivered' ? 'text-success' : 'text-warning'}">${o.status}</span></td></tr>`).join('')}</tbody></table>` : '<p>No orders.</p>'}
    `;
}

// ---- CATEGORIES ----
function renderAdminCategories(container) {
    let html = `<h4 style="margin-bottom:10px;">Manage Categories & Subcategories</h4><button class="btn-sm primary" onclick="openAddCategory()"><i class="fas fa-plus"></i> Add Category</button><div style="margin-top:12px;">`;
    categories.forEach(cat => {
        html += `<div style="background:var(--bg-body); padding:12px; border-radius:var(--radius); margin-bottom:8px;"><div style="display:flex; justify-content:space-between; align-items:center;"><strong>${cat.icon ? `<i class="fas ${cat.icon}"></i>` : ''} ${cat.name}</strong><div><button class="btn-sm primary" onclick="editCategory(${cat.id})">Edit</button><button class="btn-sm danger" onclick="deleteCategory(${cat.id})">Delete</button><button class="btn-sm primary" onclick="openAddSubcategory(${cat.id})">+ Sub</button></div></div><div style="padding-left:20px; margin-top:4px;">${cat.subcategories.map(sub => `<span style="display:inline-block; background:var(--bg-card); padding:2px 10px; border-radius:12px; margin:2px; font-size:0.8rem;">${sub.name} <i class="fas fa-times" style="color:var(--danger); cursor:pointer; margin-left:4px;" onclick="deleteSubcategory(${cat.id}, ${sub.id})"></i></span>`).join('')}</div></div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}
function openAddCategory() {
    document.getElementById('addCatModalTitle').textContent = 'Add New Category';
    document.getElementById('addCatFields').innerHTML = `<div class="form-group"><label>Category Name</label><input type="text" id="catName" required placeholder="e.g. Seeds" /></div><div class="form-group"><label>Icon (FontAwesome class)</label><input type="text" id="catIcon" placeholder="fa-seedling" /></div>`;
    document.getElementById('addCatForm').onsubmit = function(e) { e.preventDefault(); const name = document.getElementById('catName').value.trim(); const icon = document.getElementById('catIcon').value.trim() || 'fa-tag'; if (!name) { toast('error', 'Name is required.'); return; } categories.push({ id: Date.now(), name, slug: name.toLowerCase().replace(/\s/g,'-'), icon, subcategories: [] }); toast('success', 'Category added.'); closeModal('addCatModal'); saveState(); renderDashboard(); }; openModal('addCatModal');
}
function editCategory(id) {
    const cat = categories.find(c => c.id === id); if (!cat) return;
    document.getElementById('addCatModalTitle').textContent = 'Edit Category';
    document.getElementById('addCatFields').innerHTML = `<div class="form-group"><label>Category Name</label><input type="text" id="catName" value="${cat.name}" required /></div><div class="form-group"><label>Icon</label><input type="text" id="catIcon" value="${cat.icon || ''}" /></div><input type="hidden" id="editCatId" value="${cat.id}" />`;
    document.getElementById('addCatForm').onsubmit = function(e) { e.preventDefault(); const name = document.getElementById('catName').value.trim(); const icon = document.getElementById('catIcon').value.trim() || 'fa-tag'; const cid = parseInt(document.getElementById('editCatId').value); const cat2 = categories.find(c => c.id === cid); if (cat2) { cat2.name = name; cat2.icon = icon; cat2.slug = name.toLowerCase().replace(/\s/g,'-'); } toast('success', 'Category updated.'); closeModal('addCatModal'); saveState(); renderDashboard(); }; openModal('addCatModal');
}
function deleteCategory(id) { if (!confirm('Delete this category?')) return; categories = categories.filter(c => c.id !== id); toast('info', 'Category deleted.'); saveState(); renderDashboard(); }
function openAddSubcategory(catId) {
    document.getElementById('addCatModalTitle').textContent = 'Add Subcategory';
    document.getElementById('addCatFields').innerHTML = `<div class="form-group"><label>Subcategory Name</label><input type="text" id="subName" required placeholder="e.g. Maize" /></div><input type="hidden" id="subCatId" value="${catId}" />`;
    document.getElementById('addCatForm').onsubmit = function(e) { e.preventDefault(); const name = document.getElementById('subName').value.trim(); const cid = parseInt(document.getElementById('subCatId').value); const cat = categories.find(c => c.id === cid); if (!cat) { toast('error', 'Category not found.'); return; } cat.subcategories.push({ id: Date.now(), name }); toast('success', 'Subcategory added.'); closeModal('addCatModal'); saveState(); renderDashboard(); }; openModal('addCatModal');
}
function deleteSubcategory(catId, subId) { const cat = categories.find(c => c.id === catId); if (!cat) return; cat.subcategories = cat.subcategories.filter(s => s.id !== subId); toast('info', 'Subcategory deleted.'); saveState(); renderDashboard(); }

// ---- BRANDS ----
function renderAdminBrands(container) {
    let html = `<h4 style="margin-bottom:10px;">Manage Brands</h4><button class="btn-sm primary" onclick="openAddBrand()"><i class="fas fa-plus"></i> Add Brand</button><div style="margin-top:12px; display:flex; flex-wrap:wrap; gap:8px;">`;
    brands.forEach(b => { html += `<div style="background:var(--bg-body); padding:8px 16px; border-radius:var(--radius); display:flex; align-items:center; gap:8px;">${b.logo ? `<img src="${b.logo}" style="height:30px;" />` : ''} <strong>${b.name}</strong><button class="btn-sm primary" onclick="editBrand(${b.id})">Edit</button><button class="btn-sm danger" onclick="deleteBrand(${b.id})">Delete</button></div>`; });
    html += `</div>`;
    container.innerHTML = html;
}
function openAddBrand() {
    document.getElementById('addCatModalTitle').textContent = 'Add Brand';
    document.getElementById('addCatFields').innerHTML = `<div class="form-group"><label>Brand Name</label><input type="text" id="brandName" required placeholder="e.g. AgriSeed" /></div><div class="form-group"><label>Logo URL (optional)</label><input type="text" id="brandLogo" placeholder="https://..." /></div>`;
    document.getElementById('addCatForm').onsubmit = function(e) { e.preventDefault(); const name = document.getElementById('brandName').value.trim(); const logo = document.getElementById('brandLogo').value.trim(); if (!name) { toast('error', 'Name is required.'); return; } brands.push({ id: Date.now(), name, logo }); toast('success', 'Brand added.'); closeModal('addCatModal'); saveState(); renderDashboard(); }; openModal('addCatModal');
}
function editBrand(id) { const b = brands.find(b => b.id === id); if (!b) return; document.getElementById('addCatModalTitle').textContent = 'Edit Brand'; document.getElementById('addCatFields').innerHTML = `<div class="form-group"><label>Brand Name</label><input type="text" id="brandName" value="${b.name}" required /></div><div class="form-group"><label>Logo URL</label><input type="text" id="brandLogo" value="${b.logo || ''}" /></div><input type="hidden" id="editBrandId" value="${b.id}" />`; document.getElementById('addCatForm').onsubmit = function(e) { e.preventDefault(); const name = document.getElementById('brandName').value.trim(); const logo = document.getElementById('brandLogo').value.trim(); const bid = parseInt(document.getElementById('editBrandId').value); const brand = brands.find(b => b.id === bid); if (brand) { brand.name = name; brand.logo = logo; } toast('success', 'Brand updated.'); closeModal('addCatModal'); saveState(); renderDashboard(); }; openModal('addCatModal'); }
function deleteBrand(id) { if (!confirm('Delete this brand?')) return; brands = brands.filter(b => b.id !== id); toast('info', 'Brand deleted.'); saveState(); renderDashboard(); }

// ---- TAGS ----
function renderAdminTags(container) {
    let html = `<h4 style="margin-bottom:10px;">Manage Tags</h4><button class="btn-sm primary" onclick="openAddTag()"><i class="fas fa-plus"></i> Add Tag</button><div style="margin-top:12px; display:flex; flex-wrap:wrap; gap:8px;">`;
    tags.forEach(t => { html += `<span style="background:var(--bg-body); padding:4px 14px; border-radius:16px;">${t.name} <i class="fas fa-times" style="color:var(--danger); cursor:pointer; margin-left:6px;" onclick="deleteTag(${t.id})"></i></span>`; });
    html += `</div>`;
    container.innerHTML = html;
}
function openAddTag() {
    document.getElementById('addCatModalTitle').textContent = 'Add Tag';
    document.getElementById('addCatFields').innerHTML = `<div class="form-group"><label>Tag Name</label><input type="text" id="tagName" required placeholder="e.g. Organic" /></div>`;
    document.getElementById('addCatForm').onsubmit = function(e) { e.preventDefault(); const name = document.getElementById('tagName').value.trim(); if (!name) { toast('error', 'Name is required.'); return; } tags.push({ id: Date.now(), name }); toast('success', 'Tag added.'); closeModal('addCatModal'); saveState(); renderDashboard(); }; openModal('addCatModal');
}
function deleteTag(id) { if (!confirm('Delete this tag?')) return; tags = tags.filter(t => t.id !== id); toast('info', 'Tag deleted.'); saveState(); renderDashboard(); }

// ---- COMMISSIONS ----
function renderAdminCommissions(container) {
    container.innerHTML = `<h4 style="margin-bottom:10px;">Global Commission Settings</h4><div style="max-width:300px;"><div class="form-group"><label>Default Commission (%)</label><input type="number" id="globalCommInput" value="${globalCommission}" step="0.5" min="0" max="100" style="width:100%; padding:8px 12px; border:1.5px solid var(--border-color); border-radius:6px; background:var(--input-bg); color:var(--text-primary);" /><button class="btn-sm primary" style="margin-top:8px;" onclick="updateGlobalCommission()">Update</button></div></div><h4 style="margin-top:20px;">Vendor-specific Commissions</h4><table><thead><tr><th>Vendor</th><th>Commission</th><th>Action</th></tr></thead><tbody>${vendors.map(v => `<tr><td>${v.storeName}</td><td><input type="number" id="vendorComm_${v.id}" value="${v.commission || globalCommission}" step="0.5" min="0" max="100" style="width:70px; padding:4px; border:1px solid var(--border-color); border-radius:4px; background:var(--input-bg); color:var(--text-primary);" /></td><td><button class="btn-sm primary" onclick="updateVendorCommission(${v.id})">Save</button></td></tr>`).join('')}</tbody></table>`;
}
function updateGlobalCommission() { const val = parseFloat(document.getElementById('globalCommInput').value); if (isNaN(val) || val < 0 || val > 100) { toast('error', 'Invalid percentage.'); return; } globalCommission = val; toast('success', 'Global commission updated.'); saveState(); renderDashboard(); }
function updateVendorCommission(vendorId) { const input = document.getElementById(`vendorComm_${vendorId}`); if (!input) return; const val = parseFloat(input.value); if (isNaN(val) || val < 0 || val > 100) { toast('error', 'Invalid percentage.'); return; } const vendor = vendors.find(v => v.id === vendorId); if (vendor) vendor.commission = val; toast('success', `Commission for ${vendor.storeName} updated.`); saveState(); renderDashboard(); }

// ---- VENDORS ----
function renderAdminVendors(container) {
    if (!vendors.length) { container.innerHTML = '<p>No vendors.</p>'; return; }
    container.innerHTML = `<h4 style="margin-bottom:10px;">All Vendors</h4><table><thead><tr><th>Store</th><th>Email</th><th>Balance</th><th>Commission</th><th>Actions</th></tr></thead><tbody>${vendors.map(v => `<tr><td><strong>${v.storeName}</strong><br><span style="font-size:0.7rem; color:var(--text-muted);">${v.vendorId}</span></td><td>${v.email}</td><td>${formatPrice(v.balance || 0)}</td><td>${v.commission || globalCommission}%</td><td><button class="btn-sm danger" onclick="if(confirm('Delete vendor?')) deleteVendor(${v.id})">Delete</button></td></tr>`).join('')}</tbody></table>`;
}
function deleteVendor(id) { vendors = vendors.filter(v => v.id !== id); toast('info', 'Vendor deleted.'); saveState(); renderDashboard(); }

// ---- PENDING VENDORS ----
function renderAdminPendingVendors(container) {
    const pending = pendingVendors.filter(v => !v.approved);
    if (!pending.length) { container.innerHTML = '<p>No pending vendors.</p>'; return; }
    container.innerHTML = `<h4 style="margin-bottom:10px;">Pending Vendor Approvals</h4><table><thead><tr><th>Store</th><th>Email</th><th>Goods</th><th>Actions</th></tr></thead><tbody>${pending.map(v => `<tr><td><strong>${v.storeName}</strong></td><td>${v.email}</td><td>${v.goodsTypes?.join(', ') || 'N/A'}</td><td><button class="btn-sm success" onclick="approveVendor(${v.id})">Approve</button><button class="btn-sm danger" onclick="rejectVendor(${v.id})">Reject</button></td></tr>`).join('')}</tbody></table>`;
}
function approveVendor(vendorId) {
    const pending = pendingVendors.find(v => v.id === vendorId); if (!pending) return; pending.approved = true; const newVendor = { id: vendorIdCounter++, vendorId: 'VENDOR-' + String(1000 + vendors.length + 1), name: pending.name, storeName: pending.storeName, goodsTypes: pending.goodsTypes, desc: pending.desc, location: pending.location, phone: pending.phone, email: pending.email, approved: true, earnings: 0, balance: 0, commission: globalCommission, joinedAt: new Date().toISOString() }; vendors.push(newVendor); const idx = pendingVendors.indexOf(pending); if (idx > -1) pendingVendors.splice(idx, 1); addNotification(pending.email, 'Vendor Approved', 'Your vendor application has been approved.', 'success'); toast('success', 'Vendor approved.'); saveState(); renderDashboard();
}
function rejectVendor(vendorId) {
    const pending = pendingVendors.find(v => v.id === vendorId); if (!pending) return; addNotification(pending.email, 'Vendor Rejected', 'Your application was rejected.', 'error'); const idx = pendingVendors.indexOf(pending); if (idx > -1) pendingVendors.splice(idx, 1); toast('info', 'Vendor rejected.'); saveState(); renderDashboard();
}

// ---- PRODUCTS ----
function renderAdminProducts(container) {
    container.innerHTML = `<h4 style="margin-bottom:10px;">All Products (${products.length})</h4><table><thead><tr><th>Name</th><th>Vendor</th><th>Price</th><th>Featured</th><th>Actions</th></tr></thead><tbody>${products.map(p => { const vendor = vendors.find(v => v.id === p.vendorId); return `<tr><td>${p.name}</td><td>${vendor ? vendor.storeName : 'N/A'}</td><td>${formatPrice(p.price)}</td><td>${p.featured ? '⭐ Yes' : 'No'}</td><td><button class="btn-sm primary" onclick="toggleFeature(${p.id})">${p.featured ? 'Unfeature' : 'Feature'}</button><button class="btn-sm danger" onclick="if(confirm('Delete?')) deleteProduct(${p.id})">Delete</button></td></tr>`; }).join('')}</tbody></table>`;
}
function toggleFeature(productId) { const p = products.find(pr => pr.id === productId); if (!p) return; p.featured = !p.featured; toast('success', `${p.name} ${p.featured ? 'featured' : 'unfeatured'}.`); saveState(); renderDashboard(); }
function deleteProduct(productId) { products = products.filter(p => p.id !== productId); toast('info', 'Product deleted.'); saveState(); renderDashboard(); }

// ---- ORDERS ----
function renderAdminOrders(container) {
    if (!orders.length) { container.innerHTML = '<p>No orders.</p>'; return; }
    container.innerHTML = `<h4 style="margin-bottom:10px;">All Orders (${orders.length})</h4><table><thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Vendors</th><th>Actions</th></tr></thead><tbody>${orders.map(o => `<tr><td>#${o.id}</td><td>${o.customerName}</td><td>${o.items.length}</td><td>${formatPrice(o.totalUSD)}</td><td><span class="${o.status === 'delivered' ? 'text-success' : o.status === 'pending' ? 'text-warning' : 'text-danger'}">${o.status}</span></td><td>${o.vendorIds ? o.vendorIds.map(id => vendors.find(v => v.id === id)?.storeName).join(', ') : 'N/A'}</td><td>${o.status === 'pending' ? `<button class="btn-sm warning" onclick="markOrderDelivered(${o.id})">Deliver</button>` : ''}</td></tr>`).join('')}</tbody></table>`;
}
function markOrderDelivered(orderId) {
    const order = orders.find(o => o.id === orderId); if (!order) return; order.status = 'delivered'; order.vendorIds.forEach(vid => { const vendor = vendors.find(v => v.id === vid); if (vendor) { const items = order.items.filter(item => item.vendorId === vid); const total = items.reduce((sum, item) => sum + item.price * item.qty, 0); const commission = (vendor.commission || globalCommission) / 100; const earning = total * (1 - commission); vendor.balance = (vendor.balance || 0) + earning; vendor.earnings = (vendor.earnings || 0) + earning; } }); toast('success', `Order #${order.id} delivered.`); saveState(); renderDashboard();
}

// ---- WITHDRAWALS ----
function renderAdminWithdrawals(container) {
    if (!withdrawals.length) { container.innerHTML = '<p>No withdrawal requests.</p>'; return; }
    container.innerHTML = `<h4 style="margin-bottom:10px;">Withdrawal Requests</h4><table><thead><tr><th>Vendor</th><th>Amount</th><th>Account</th><th>Status</th><th>Actions</th></tr></thead><tbody>${withdrawals.map(w => `<tr><td>${w.vendorName}</td><td>${formatPrice(w.amountUSD)}</td><td>${w.account}</td><td><span class="${w.status === 'approved' ? 'text-success' : w.status === 'rejected' ? 'text-danger' : 'text-warning'}">${w.status}</span></td><td>${w.status === 'pending' ? `<button class="btn-sm success" onclick="approveWithdrawal(${w.id})">Approve</button><button class="btn-sm danger" onclick="rejectWithdrawal(${w.id})">Reject</button>` : '-'}</td></tr>`).join('')}</tbody></table>`;
}
function approveWithdrawal(id) { const w = withdrawals.find(w => w.id === id); if (!w) return; w.status = 'approved'; const vendor = vendors.find(v => v.id === w.vendorId); if (vendor) { vendor.balance = (vendor.balance || 0) - w.amountUSD; addNotification(vendor.email, 'Withdrawal Approved', `Withdrawal of ${formatPrice(w.amountUSD)} approved.`, 'success'); } toast('success', 'Withdrawal approved.'); saveState(); renderDashboard(); }
function rejectWithdrawal(id) { const w = withdrawals.find(w => w.id === id); if (!w) return; w.status = 'rejected'; const vendor = vendors.find(v => v.id === w.vendorId); if (vendor) { addNotification(vendor.email, 'Withdrawal Rejected', `Withdrawal of ${formatPrice(w.amountUSD)} rejected.`, 'error'); } toast('info', 'Withdrawal rejected.'); saveState(); renderDashboard(); }

// ---- COUPONS ----
function renderAdminCoupons(container) {
    container.innerHTML = `<h4 style="margin-bottom:10px;">Coupon Management</h4><div style="background:var(--bg-body); padding:16px; border-radius:var(--radius); margin-bottom:16px;"><h5 style="margin-bottom:8px;">Create New Coupon</h5><div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; align-items:end;"><div><label style="display:block; font-size:0.7rem; font-weight:600;">Code</label><input type="text" id="couponCode" placeholder="e.g. SUMMER20" style="width:100%; padding:6px 10px; border:1px solid var(--border-color); border-radius:4px; background:var(--input-bg); color:var(--text-primary);" /></div><div><label style="display:block; font-size:0.7rem; font-weight:600;">Type</label><select id="couponType" style="width:100%; padding:6px 10px; border:1px solid var(--border-color); border-radius:4px; background:var(--input-bg); color:var(--text-primary);"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount</option></select></div><div><label style="display:block; font-size:0.7rem; font-weight:600;">Value</label><input type="number" id="couponValue" placeholder="e.g. 20" style="width:100%; padding:6px 10px; border:1px solid var(--border-color); border-radius:4px; background:var(--input-bg); color:var(--text-primary);" /></div><div><label style="display:block; font-size:0.7rem; font-weight:600;">Expiry</label><input type="date" id="couponExpiry" style="width:100%; padding:6px 10px; border:1px solid var(--border-color); border-radius:4px; background:var(--input-bg); color:var(--text-primary);" /></div></div><button class="btn-sm primary" style="margin-top:8px;" onclick="createCoupon()"><i class="fas fa-plus"></i> Create Coupon</button></div><h5 style="margin-bottom:8px;">Existing Coupons</h5>${coupons.length ? `<table><thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead><tbody>${coupons.map(c => `<tr><td><strong>${c.code}</strong></td><td>${c.type}</td><td>${c.type === 'percentage' ? c.value+'%' : formatPrice(c.value)}</td><td>${c.expiry ? new Date(c.expiry).toLocaleDateString() : 'Never'}</td><td>${c.active !== false ? '<span class="text-success">Active</span>' : '<span class="text-danger">Inactive</span>'}</td><td><button class="btn-sm danger" onclick="deleteCoupon('${c.code}')">Delete</button></td></tr>`).join('')}</tbody></table>` : '<p style="color:var(--text-muted); padding:10px 0;">No coupons created yet.</p>'}`;
}
function createCoupon() { const code = document.getElementById('couponCode').value.trim().toUpperCase(); const type = document.getElementById('couponType').value; const value = parseFloat(document.getElementById('couponValue').value); const expiry = document.getElementById('couponExpiry').value; if (!code) { toast('error', 'Please enter a coupon code.'); return; } if (!value || value <= 0) { toast('error', 'Please enter a valid value.'); return; } if (type === 'percentage' && value > 100) { toast('error', 'Percentage cannot exceed 100%.'); return; } if (coupons.find(c => c.code === code)) { toast('error', 'Coupon code already exists.'); return; } coupons.push({ code, type, value, expiry: expiry || null, active: true, createdAt: new Date().toISOString() }); toast('success', `Coupon "${code}" created!`); document.getElementById('couponCode').value = ''; document.getElementById('couponValue').value = ''; document.getElementById('couponExpiry').value = ''; saveState(); renderDashboard(); }
function deleteCoupon(code) { const idx = coupons.findIndex(c => c.code === code); if (idx > -1) { coupons.splice(idx, 1); toast('info', `Coupon "${code}" deleted.`); saveState(); renderDashboard(); } }

// ---- BANNERS ----
function renderAdminBanners(container) {
    container.innerHTML = `<h4 style="margin-bottom:10px;">Banner Management</h4><p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px;">Upload banners for the homepage carousel.</p><div class="banner-manager">${banners.map((b, i) => `<div class="banner-item">${b.image ? `<img src="${b.image}" alt="Banner ${i+1}" />` : '<div style="padding:20px; color:var(--text-muted);">No image</div>'}<div class="banner-actions"><label onclick="document.getElementById('bannerFile${i}').click()"><i class="fas fa-upload"></i> Upload</label><input type="file" id="bannerFile${i}" accept="image/*" onchange="uploadBanner(${i}, this)" /><button class="remove-banner" onclick="removeBanner(${i})"><i class="fas fa-trash"></i> Remove</button></div><div class="banner-link-input"><input type="text" placeholder="Link URL" value="${b.link || '#'}" onchange="updateBannerLink(${i}, this.value)" /></div><div style="margin-top:4px;"><input type="text" placeholder="Title" value="${b.title || ''}" style="width:100%; padding:3px 8px; border:1px solid var(--border-color); border-radius:4px; background:var(--input-bg); color:var(--text-primary); font-size:0.75rem;" onchange="updateBannerTitleText(${i}, this.value)" /></div><div style="margin-top:4px;"><input type="text" placeholder="Subtitle" value="${b.subtitle || ''}" style="width:100%; padding:3px 8px; border:1px solid var(--border-color); border-radius:4px; background:var(--input-bg); color:var(--text-primary); font-size:0.75rem;" onchange="updateBannerSubtitle(${i}, this.value)" /></div></div>`).join('')}</div><button class="btn-sm primary" onclick="addBannerSlot()"><i class="fas fa-plus"></i> Add Banner Slot</button>`;
}
function uploadBanner(index, input) { if (!input.files || !input.files[0]) return; const file = input.files[0]; const reader = new FileReader(); reader.onload = function(e) { banners[index].image = e.target.result; renderBanners(); saveState(); toast('success', 'Banner uploaded!'); renderDashboard(); }; reader.readAsDataURL(file); }
function removeBanner(index) { if (banners.length <= 1) { toast('error', 'Cannot remove the last banner.'); return; } banners.splice(index, 1); renderBanners(); saveState(); toast('info', 'Banner removed.'); renderDashboard(); }
function addBannerSlot() { banners.push({ id: Date.now(), image: '', link: '#', title: 'New Banner', subtitle: 'Add promotion here' }); renderBanners(); saveState(); toast('success', 'New banner slot added!'); renderDashboard(); }
function updateBannerLink(index, link) { banners[index].link = link; saveState(); toast('info', 'Banner link updated.'); }
function updateBannerTitleText(index, title) { banners[index].title = title; saveState(); toast('info', 'Banner title updated.'); }
function updateBannerSubtitle(index, subtitle) { banners[index].subtitle = subtitle; saveState(); toast('info', 'Banner subtitle updated.'); }

// ---- PAYMENTS ----
function renderAdminPayments(container) {
    container.innerHTML = `<h4 style="margin-bottom:10px;">Central Payment Settings</h4><p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px;">All payments are collected into this central account.</p><div style="max-width:500px;"><div class="form-group" style="margin-bottom:10px;"><label style="font-weight:600; font-size:0.8rem;">Bank Name</label><input type="text" id="centralBank" value="${centralPayment.bankName}" style="width:100%; padding:8px 12px; border:1.5px solid var(--border-color); border-radius:6px; background:var(--input-bg); color:var(--text-primary);" /></div><div class="form-group" style="margin-bottom:10px;"><label style="font-weight:600; font-size:0.8rem;">Account Number</label><input type="text" id="centralAccount" value="${centralPayment.accountNumber}" style="width:100%; padding:8px 12px; border:1.5px solid var(--border-color); border-radius:6px; background:var(--input-bg); color:var(--text-primary);" /></div><div class="form-group" style="margin-bottom:10px;"><label style="font-weight:600; font-size:0.8rem;">Account Name</label><input type="text" id="centralAccountName" value="${centralPayment.accountName}" style="width:100%; padding:8px 12px; border:1.5px solid var(--border-color); border-radius:6px; background:var(--input-bg); color:var(--text-primary);" /></div><div class="form-group" style="margin-bottom:10px;"><label style="font-weight:600; font-size:0.8rem;">Mobile Money Number</label><input type="text" id="centralMobile" value="${centralPayment.mobileMoneyNumber}" style="width:100%; padding:8px 12px; border:1.5px solid var(--border-color); border-radius:6px; background:var(--input-bg); color:var(--text-primary);" /></div><div class="form-group" style="margin-bottom:10px;"><label style="font-weight:600; font-size:0.8rem;">Mobile Money Provider</label><input type="text" id="centralProvider" value="${centralPayment.mobileMoneyProvider}" style="width:100%; padding:8px 12px; border:1.5px solid var(--border-color); border-radius:6px; background:var(--input-bg); color:var(--text-primary);" /></div><button class="btn-sm primary" onclick="updateCentralPayment()"><i class="fas fa-save"></i> Save Settings</button></div>`;
}
function updateCentralPayment() { centralPayment.bankName = document.getElementById('centralBank').value.trim(); centralPayment.accountNumber = document.getElementById('centralAccount').value.trim(); centralPayment.accountName = document.getElementById('centralAccountName').value.trim(); centralPayment.mobileMoneyNumber = document.getElementById('centralMobile').value.trim(); centralPayment.mobileMoneyProvider = document.getElementById('centralProvider').value.trim(); toast('success', 'Payment settings updated!'); saveState(); }

// ---- PROFILE ----
function renderAdminProfile(container) {
    container.innerHTML = `<h4 style="margin-bottom:10px;">Admin Profile</h4><div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; max-width:500px;"><div><strong>Name</strong><br>${currentUser.name}</div><div><strong>Email</strong><br>${currentUser.email}</div><div><strong>Phone</strong><br>${currentUser.phone || 'N/A'}</div><div><strong>Role</strong><br><span class="badge-tag">Admin</span></div><div style="grid-column:1/-1;"><strong>Status</strong><br>${currentUser.verified ? '✅ Verified' : '⚠️ Not Verified'}</div></div><button class="btn-sm danger" style="margin-top:12px;" onclick="signOut()"><i class="fas fa-sign-out-alt"></i> Sign Out</button>`;
}