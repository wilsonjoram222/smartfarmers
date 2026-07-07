// ============================================================
// VENDOR DASHBOARD
// ============================================================

function renderVendorDashboard() {
    const container = document.getElementById('dashContent');
    const vendor = vendors.find(v => v.email === currentUser.email);
    if (!vendor) {
        container.innerHTML = `<div style="text-align:center; padding:30px 0;"><i class="fas fa-store" style="font-size:3rem; color:var(--primary);"></i><h3 style="margin:10px 0;">Become a Vendor</h3><p style="color:var(--text-muted);">Start selling your agricultural products.</p><button class="btn-primary" onclick="openVendorSignup()"><i class="fas fa-arrow-right"></i> Register as Vendor</button></div>`;
        return;
    }
    const navItems = [
        { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
        { id: 'products', label: 'My Products', icon: 'fa-boxes' },
        { id: 'add-product', label: 'Add Product', icon: 'fa-plus-circle' },
        { id: 'orders', label: 'Orders', icon: 'fa-shopping-bag' },
        { id: 'earnings', label: 'Earnings', icon: 'fa-money-bill-wave' },
        { id: 'withdrawals', label: 'Withdrawals', icon: 'fa-hand-holding-usd' },
        { id: 'commissions', label: 'My Commissions', icon: 'fa-percent' },
        { id: 'profile', label: 'Profile', icon: 'fa-user' }
    ];
    document.getElementById('dashNavItems').innerHTML = navItems.map(item => `
        <div class="dash-nav-item ${dashboardActiveTab === item.id ? 'active' : ''}" onclick="switchDashTab('${item.id}')">
            <i class="fas ${item.icon}"></i> ${item.label}
        </div>
    `).join('');
    switch (dashboardActiveTab) {
        case 'overview': renderVendorOverview(container, vendor); break;
        case 'products': renderVendorProducts(container, vendor); break;
        case 'add-product': renderVendorAddProduct(container, vendor); break;
        case 'orders': renderVendorOrders(container, vendor); break;
        case 'earnings': renderVendorEarnings(container, vendor); break;
        case 'withdrawals': renderVendorWithdrawals(container, vendor); break;
        case 'commissions': renderVendorCommissions(container, vendor); break;
        case 'profile': renderVendorProfile(container, vendor); break;
        default: renderVendorOverview(container, vendor);
    }
}

// ---- OVERVIEW ----
function renderVendorOverview(container, vendor) {
    const myProducts = products.filter(p => p.vendorId === vendor.id);
    const myOrders = orders.filter(o => o.vendorIds && o.vendorIds.includes(vendor.id));
    const totalEarnings = vendor.earnings || 0;
    const balance = vendor.balance || 0;
    // best selling for this vendor
    const productSales = {};
    myOrders.forEach(o => { o.items?.forEach(item => { if (item.vendorId === vendor.id) { const key = item.name; productSales[key] = (productSales[key] || 0) + item.qty; } }); });
    const sorted = Object.entries(productSales).sort((a,b) => b[1] - a[1]).slice(0,5);
    let bestSellersHtml = sorted.length ? sorted.map(([name, qty]) => `<li style="padding:4px 0; border-bottom:1px solid var(--border-color);">${name} - ${qty} units sold</li>`).join('') : '<li>No sales yet</li>';
    const feedback = [ { customer: 'John M.', rating:5, comment:'Great seeds!' }, { customer: 'Sarah K.', rating:4, comment:'Good quality' } ];
    let feedbackHtml = feedback.map(f => `<li style="padding:4px 0; border-bottom:1px solid var(--border-color);">${f.customer} - ${'★'.repeat(f.rating)} - ${f.comment}</li>`).join('');
    container.innerHTML = `
        <div class="dash-stats">
            <div class="stat-box"><div class="num">${myProducts.length}</div><div class="label">My Products</div></div>
            <div class="stat-box"><div class="num">${myOrders.length}</div><div class="label">Orders</div></div>
            <div class="stat-box"><div class="num">${formatPrice(totalEarnings)}</div><div class="label">Total Earnings</div></div>
            <div class="stat-box"><div class="num">${formatPrice(balance)}</div><div class="label">Available Balance</div></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:16px;">
            <div><h4 style="margin-bottom:8px;">🏆 Your Best Sellers</h4><ul style="list-style:none; padding:0;">${bestSellersHtml}</ul></div>
            <div><h4 style="margin-bottom:8px;">💬 Customer Feedback</h4><ul style="list-style:none; padding:0;">${feedbackHtml}</ul></div>
        </div>
        <h4>Recent Orders</h4>
        ${myOrders.length ? `<table><thead><tr><th>#</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>${myOrders.slice(-5).reverse().map(o => `<tr><td>#${o.id}</td><td>${o.items.filter(i => i.vendorId === vendor.id).length}</td><td>${formatPrice(o.totalUSD)}</td><td>${o.status}</td></tr>`).join('')}</tbody></table>` : '<p>No orders.</p>'}
        <button class="btn-sm primary" style="margin-top:10px;" onclick="switchDashTab('add-product')"><i class="fas fa-plus"></i> Add New Product</button>
    `;
}

// ---- PRODUCTS ----
function renderVendorProducts(container, vendor) {
    const myProducts = products.filter(p => p.vendorId === vendor.id);
    if (!myProducts.length) {
        container.innerHTML = `<p style="color:var(--text-muted); padding:10px 0;">You haven't added any products yet.</p><button class="btn-sm primary" onclick="switchDashTab('add-product')"><i class="fas fa-plus"></i> Add Your First Product</button>`;
        return;
    }
    container.innerHTML = `<h4 style="margin-bottom:10px;">My Products (${myProducts.length})</h4><table><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Type</th><th>Actions</th></tr></thead><tbody>${myProducts.map(p => `<tr><td><strong>${p.name}</strong></td><td>${formatPrice(p.price)}</td><td>${p.inStock ? 'In stock' : 'Out of stock'}</td><td>${p.isVariable ? 'Variable' : 'Simple'}</td><td><button class="btn-sm primary" onclick="editVendorProduct(${p.id})">Edit</button><button class="btn-sm danger" onclick="if(confirm('Delete?')) deleteVendorProduct(${p.id})">Delete</button></td></tr>`).join('')}</tbody></table><button class="btn-sm primary" style="margin-top:10px;" onclick="switchDashTab('add-product')"><i class="fas fa-plus"></i> Add New Product</button>`;
}
function deleteVendorProduct(productId) { const idx = products.findIndex(p => p.id === productId); if (idx > -1) { products.splice(idx, 1); toast('info', 'Product deleted.'); saveState(); renderDashboard(); } }
function editVendorProduct(productId) { const p = products.find(pr => pr.id === productId); if (!p) { toast('error', 'Product not found.'); return; } const newPrice = prompt(`Enter new price for ${p.name} (current: ${p.price})`, p.price); if (newPrice !== null && !isNaN(parseFloat(newPrice))) { p.price = parseFloat(newPrice); toast('success', `Price updated.`); saveState(); renderDashboard(); } }

// ---- ADD PRODUCT ----
function renderVendorAddProduct(container, vendor) {
    container.innerHTML = `<h4 style="margin-bottom:10px;">${editingProductId ? 'Edit Product' : 'Add New Product'}</h4><form id="vendorProductForm" onsubmit="saveVendorProduct(event, ${vendor.id})"><div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;"><div class="form-group"><label>Product Name</label><input type="text" id="vp_name" required placeholder="e.g. Organic Fertilizer" /></div><div class="form-group"><label>Category</label><select id="vp_category" required>${categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}</select></div><div class="form-group"><label>Subcategory</label><select id="vp_subcategory"><option value="">Select</option></select></div><div class="form-group"><label>Brand</label><select id="vp_brand">${brands.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}</select></div><div class="form-group"><label>Tags (comma separated)</label><input type="text" id="vp_tags" placeholder="Organic, Non-GMO" /></div><div class="form-group"><label>Description</label><textarea id="vp_desc" rows="2" placeholder="Description"></textarea></div><div class="form-group"><label>Base Price (USD)</label><input type="number" id="vp_price" step="0.01" placeholder="0.00" /></div><div class="form-group"><label>Original Price (USD)</label><input type="number" id="vp_original" step="0.01" placeholder="0.00" /></div><div class="form-group"><label>Stock</label><select id="vp_stock"><option value="true">In Stock</option><option value="false">Out of Stock</option></select></div><div class="form-group" style="grid-column:1/-1;"><label>Product Type</label><select id="vp_type" onchange="toggleVariationFieldsVendor()"><option value="simple">Simple</option><option value="variable">Variable</option></select></div><div class="form-group" style="grid-column:1/-1; display:none;" id="vp_variation_fields"><label>Variations (name:price:stock, one per line)</label><textarea id="vp_variations" rows="3" placeholder="e.g. 1kg:4500:100&#10;5kg:20000:50"></textarea><p style="font-size:0.7rem; color:var(--text-muted);">Format: name:price:stock</p></div><div class="form-group" style="grid-column:1/-1;"><label>Product Images (URLs, one per line)</label><textarea id="vp_images" rows="2" placeholder="https://example.com/image1.jpg"></textarea></div><div class="form-group" style="grid-column:1/-1;"><label>Upload Images</label><input type="file" id="vp_image_file" multiple accept="image/*" /><div id="vp_image_preview" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;"></div></div></div><button type="submit" class="btn-primary"><i class="fas fa-save"></i> Save Product</button></form>`;
    document.getElementById('vp_category').addEventListener('change', function() { const cat = categories.find(c => c.name === this.value); const subSelect = document.getElementById('vp_subcategory'); subSelect.innerHTML = '<option value="">Select</option>'; if (cat) { cat.subcategories.forEach(sub => { subSelect.innerHTML += `<option value="${sub.name}">${sub.name}</option>`; }); } });
    document.getElementById('vp_image_file').addEventListener('change', function(e) { const preview = document.getElementById('vp_image_preview'); preview.innerHTML = ''; Array.from(e.target.files).forEach(file => { const reader = new FileReader(); reader.onload = function(ev) { const img = document.createElement('img'); img.src = ev.target.result; img.style.width = '80px'; img.style.height = '80px'; img.style.objectFit = 'cover'; img.style.borderRadius = '4px'; img.style.border = '1px solid var(--border-color)'; preview.appendChild(img); }; reader.readAsDataURL(file); }); });
    if (editingProductId) { const p = products.find(pr => pr.id === editingProductId); if (p) { document.getElementById('vp_name').value = p.name; document.getElementById('vp_category').value = p.category; document.getElementById('vp_category').dispatchEvent(new Event('change')); setTimeout(() => { document.getElementById('vp_subcategory').value = p.subcategory || ''; }, 100); document.getElementById('vp_brand').value = p.brand || ''; document.getElementById('vp_tags').value = p.tags ? p.tags.join(', ') : ''; document.getElementById('vp_desc').value = p.desc || ''; document.getElementById('vp_price').value = p.price; document.getElementById('vp_original').value = p.originalPrice || ''; document.getElementById('vp_stock').value = p.inStock ? 'true' : 'false'; if (p.isVariable && p.variations.length) { document.getElementById('vp_type').value = 'variable'; toggleVariationFieldsVendor(); document.getElementById('vp_variations').value = p.variations.map(v => `${v.name}:${v.price}:${v.stock}`).join('\n'); } else { document.getElementById('vp_type').value = 'simple'; toggleVariationFieldsVendor(); } if (p.images && p.images.length) { document.getElementById('vp_images').value = p.images.join('\n'); } } }
}
function toggleVariationFieldsVendor() { const type = document.getElementById('vp_type').value; document.getElementById('vp_variation_fields').style.display = type === 'variable' ? 'block' : 'none'; }
function saveVendorProduct(e, vendorId) {
    e.preventDefault();
    const name = document.getElementById('vp_name').value.trim(), category = document.getElementById('vp_category').value, subcategory = document.getElementById('vp_subcategory').value, brand = document.getElementById('vp_brand').value, tags = document.getElementById('vp_tags').value.split(',').map(s => s.trim()).filter(Boolean), desc = document.getElementById('vp_desc').value.trim(), price = parseFloat(document.getElementById('vp_price').value), original = parseFloat(document.getElementById('vp_original').value) || 0, inStock = document.getElementById('vp_stock').value === 'true', type = document.getElementById('vp_type').value, variationsText = document.getElementById('vp_variations').value.trim(), imagesText = document.getElementById('vp_images').value.trim();
    if (!name || !price) { toast('error', 'Name and price are required.'); return; }
    let variations = [], isVariable = false;
    if (type === 'variable' && variationsText) { variations = variationsText.split('\n').filter(line => line.trim()).map(line => { const parts = line.split(':').map(s => s.trim()); return { name: parts[0], price: parseFloat(parts[1]) || price, stock: parseInt(parts[2]) || 0 }; }); isVariable = true; }
    let images = imagesText ? imagesText.split('\n').filter(line => line.trim()) : [];
    const fileInput = document.getElementById('vp_image_file');
    if (fileInput.files.length) {
        const readers = Array.from(fileInput.files).map(file => new Promise(resolve => { const reader = new FileReader(); reader.onload = (e) => resolve(e.target.result); reader.readAsDataURL(file); }));
        Promise.all(readers).then(dataUrls => { images = images.concat(dataUrls); saveProductData(); });
    } else { saveProductData(); }
    function saveProductData() {
        const productData = { name, desc: desc || `High-quality ${category} product`, price: isVariable && variations.length ? variations[0].price : price, originalPrice: original || 0, category, subcategory: subcategory || '', brand: brand || '', tags, icon: 'fa-box', rating: 0, reviews: 0, inStock, vendorId, isVariable, variations, images, featured: false };
        if (editingProductId) { const existing = products.find(p => p.id === editingProductId); if (existing) { Object.assign(existing, productData); toast('success', 'Product updated.'); } } else { productData.id = productIdCounter++; products.push(productData); toast('success', 'Product added.'); }
        editingProductId = null; closeModal('productModal'); saveState(); switchDashTab('products');
    }
}

// ---- ORDERS ----
function renderVendorOrders(container, vendor) {
    const myOrders = orders.filter(o => o.vendorIds && o.vendorIds.includes(vendor.id));
    if (!myOrders.length) { container.innerHTML = '<p>No orders assigned to you.</p>'; return; }
    container.innerHTML = `<h4 style="margin-bottom:10px;">My Orders (${myOrders.length})</h4><table><thead><tr><th>#</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>${myOrders.map(o => `<tr><td>#${o.id}</td><td>${o.items.filter(i => i.vendorId === vendor.id).length}</td><td>${formatPrice(o.totalUSD)}</td><td><span class="${o.status === 'delivered' ? 'text-success' : 'text-warning'}">${o.status}</span></td><td>${o.status === 'pending' ? `<button class="btn-sm success" onclick="vendorConfirmOrder(${o.id})">Ship</button>` : ''}</td></tr>`).join('')}</tbody></table>`;
}
function vendorConfirmOrder(orderId) {
    const order = orders.find(o => o.id === orderId); if (!order) return; order.status = 'shipped'; // assign delivery
    assignDelivery(orderId);
    toast('success', 'Order shipped. Delivery assigned.'); saveState(); renderDashboard();
}
function assignDelivery(orderId) {
    const available = deliveryPersons.filter(d => { const active = deliveryRequests.filter(r => r.deliveryPersonId === d.id && (r.status === 'assigned' || r.status === 'picked')); return active.length < 3; });
    if (!available.length) { toast('warning', 'No delivery persons available.'); return; }
    const deliveryPerson = available[0];
    const request = { id: deliveryRequestIdCounter++, orderId, deliveryPersonId: deliveryPerson.id, status: 'pending_acceptance', assignedAt: new Date().toISOString() };
    deliveryRequests.push(request);
    addNotification(deliveryPerson.email, 'New Delivery Assignment', `Order #${orderId} assigned.`, 'info');
    toast('info', `Delivery assigned to ${deliveryPerson.fullName}`);
}

// ---- EARNINGS ----
function renderVendorEarnings(container, vendor) {
    const totalEarnings = vendor.earnings || 0; const balance = vendor.balance || 0;
    const myOrders = orders.filter(o => o.vendorIds && o.vendorIds.includes(vendor.id));
    let earningsDetails = myOrders.map(o => { const items = o.items.filter(i => i.vendorId === vendor.id); const total = items.reduce((sum, item) => sum + item.price * item.qty, 0); const commission = (vendor.commission || globalCommission) / 100; const earned = total * (1 - commission); return `<tr><td>#${o.id}</td><td>${formatPrice(total)}</td><td>${(commission*100).toFixed(1)}%</td><td>${formatPrice(earned)}</td><td>${o.status}</td></tr>`; }).join('');
    container.innerHTML = `<h4 style="margin-bottom:10px;">Earnings</h4><div class="dash-stats"><div class="stat-box"><div class="num">${formatPrice(totalEarnings)}</div><div class="label">Total Earnings</div></div><div class="stat-box"><div class="num">${formatPrice(balance)}</div><div class="label">Available Balance</div></div></div><h4>Transaction History</h4><table><thead><tr><th>Order</th><th>Total</th><th>Commission</th><th>Earned</th><th>Status</th></tr></thead><tbody>${earningsDetails || '<tr><td colspan="5">No transactions.</td></tr>'}</tbody></table>`;
}

// ---- WITHDRAWALS ----
function renderVendorWithdrawals(container, vendor) {
    const myWithdrawals = withdrawals.filter(w => w.vendorId === vendor.id);
    container.innerHTML = `<h4 style="margin-bottom:10px;">Withdrawals</h4><button class="btn-sm primary" onclick="openWithdrawModal()"><i class="fas fa-hand-holding-usd"></i> Request Withdrawal</button><div style="margin-top:12px;"><p>Available Balance: <strong>${formatPrice(vendor.balance || 0)}</strong></p></div><table style="margin-top:12px;"><thead><tr><th>Amount</th><th>Account</th><th>Status</th><th>Date</th></tr></thead><tbody>${myWithdrawals.map(w => `<tr><td>${formatPrice(w.amountUSD)}</td><td>${w.account}</td><td><span class="${w.status === 'approved' ? 'text-success' : w.status === 'rejected' ? 'text-danger' : 'text-warning'}">${w.status}</span></td><td>${new Date(w.requestedAt).toLocaleDateString()}</td></tr>`).join('') || '<tr><td colspan="4">No requests.</td></tr>'}</tbody></table>`;
}
function openWithdrawModal() { openModal('withdrawModal'); }
function requestWithdrawal(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('withdrawAmount').value), account = document.getElementById('withdrawAccount').value.trim(), accountName = document.getElementById('withdrawName').value.trim();
    if (!amount || amount < 1000) { toast('error', 'Minimum amount 1000 UGX.'); return; }
    if (!account || !accountName) { toast('error', 'Account details required.'); return; }
    const vendor = vendors.find(v => v.email === currentUser.email); if (!vendor) { toast('error', 'Vendor not found.'); return; }
    const amountUSD = amount / currency.rate; if (amountUSD > (vendor.balance || 0)) { toast('error', 'Insufficient balance.'); return; }
    withdrawals.push({ id: withdrawalIdCounter++, vendorId: vendor.id, vendorName: vendor.storeName, amountUSD, amountLocal: amount, account, accountName, status: 'pending', requestedAt: new Date().toISOString() });
    addNotification('admin', 'New Withdrawal Request', `${vendor.storeName} requested ${formatPrice(amountUSD)}`, 'warning');
    toast('success', 'Withdrawal request submitted.'); closeModal('withdrawModal'); saveState(); renderDashboard();
}

// ---- COMMISSIONS ----
function renderVendorCommissions(container, vendor) {
    const commissions = vendor.commissions || globalCommissions;
    container.innerHTML = `<h4 style="margin-bottom:10px;">My Commission Rates</h4><p style="font-size:0.8rem; color:var(--text-muted);">These are the commission rates applied to your sales per category.</p><div class="commission-grid">${Object.entries(commissions).map(([cat, val]) => `<div class="commission-item"><span class="cat-name">${cat}</span><span style="font-weight:700; color:var(--primary-dark-orange);">${val}%</span></div>`).join('')}</div>`;
}

// ---- PROFILE ----
function renderVendorProfile(container, vendor) {
    container.innerHTML = `<h4>Vendor Profile</h4><div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; max-width:500px;"><div><strong>Store</strong><br>${vendor.storeName}</div><div><strong>Vendor ID</strong><br>${vendor.vendorId}</div><div><strong>Email</strong><br>${vendor.email}</div><div><strong>Phone</strong><br>${vendor.phone}</div><div><strong>Location</strong><br>${vendor.location}</div><div><strong>Commission</strong><br>${vendor.commission || globalCommission}%</div><div style="grid-column:1/-1;"><strong>Goods Types</strong><br>${vendor.goodsTypes?.join(', ') || 'N/A'}</div></div><button class="btn-sm danger" onclick="signOut()">Sign Out</button>`;
}