// ============================================================
// DELIVERY DASHBOARD
// ============================================================

function renderDeliveryDashboard() {
    const container = document.getElementById('dashContent');
    const deliveryPerson = deliveryPersons.find(d => d.email === currentUser.email);
    if (!deliveryPerson) {
        container.innerHTML = `<div style="text-align:center; padding:30px 0;"><i class="fas fa-truck" style="font-size:3rem; color:var(--primary);"></i><h3>Become a Delivery Partner</h3><button class="btn-primary" onclick="openDeliveryRegistration()">Register Now</button></div>`;
        return;
    }
    const navItems = [
        { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
        { id: 'orders', label: 'My Deliveries', icon: 'fa-truck' },
        { id: 'earnings', label: 'Earnings', icon: 'fa-money-bill-wave' },
        { id: 'withdrawals', label: 'Withdrawals', icon: 'fa-hand-holding-usd' },
        { id: 'profile', label: 'Profile', icon: 'fa-user' }
    ];
    document.getElementById('dashNavItems').innerHTML = navItems.map(item => `
        <div class="dash-nav-item ${dashboardActiveTab === item.id ? 'active' : ''}" onclick="switchDashTab('${item.id}')">
            <i class="fas ${item.icon}"></i> ${item.label}
        </div>
    `).join('');
    switch (dashboardActiveTab) {
        case 'overview': renderDeliveryOverview(container, deliveryPerson); break;
        case 'orders': renderDeliveryOrders(container, deliveryPerson); break;
        case 'earnings': renderDeliveryEarnings(container, deliveryPerson); break;
        case 'withdrawals': renderDeliveryWithdrawals(container, deliveryPerson); break;
        case 'profile': renderDeliveryProfile(container, deliveryPerson); break;
        default: renderDeliveryOverview(container, deliveryPerson);
    }
}

// ---- OVERVIEW ----
function renderDeliveryOverview(container, deliveryPerson) {
    const myDeliveries = deliveryRequests.filter(r => r.deliveryPersonId === deliveryPerson.id);
    const pending = myDeliveries.filter(r => r.status === 'assigned' || r.status === 'picked');
    const completed = myDeliveries.filter(r => r.status === 'delivered').length;
    container.innerHTML = `
        <div class="dash-stats">
            <div class="stat-box"><div class="num">${myDeliveries.length}</div><div class="label">Total Deliveries</div></div>
            <div class="stat-box"><div class="num">${pending.length}</div><div class="label">Pending</div></div>
            <div class="stat-box"><div class="num">${completed}</div><div class="label">Completed</div></div>
        </div>
        <h4 style="margin:12px 0 8px;">Recent Deliveries</h4>
        ${myDeliveries.length ? `<table><thead><tr><th>Order #</th><th>Status</th><th>Action</th></tr></thead><tbody>${myDeliveries.slice(-5).reverse().map(r => `<tr><td>#${r.orderId}</td><td><span class="${r.status === 'delivered' ? 'text-success' : r.status === 'picked' ? 'text-warning' : 'text-info'}">${r.status}</span></td><td>${r.status === 'assigned' ? `<button class="btn-sm primary" onclick="pickupDelivery(${r.id})">Pickup</button>` : ''}${r.status === 'picked' ? `<button class="btn-sm success" onclick="deliverOrder(${r.id})">Deliver</button>` : ''}</td></tr>`).join('')}</tbody></table>` : '<p>No deliveries assigned yet.</p>'}
    `;
}

// ---- ORDERS ----
function renderDeliveryOrders(container, deliveryPerson) {
    const myDeliveries = deliveryRequests.filter(r => r.deliveryPersonId === deliveryPerson.id);
    if (!myDeliveries.length) { container.innerHTML = '<p>No deliveries assigned.</p>'; return; }
    container.innerHTML = `<h4 style="margin-bottom:10px;">My Deliveries</h4><table><thead><tr><th>Order #</th><th>Status</th><th>Action</th></tr></thead><tbody>${myDeliveries.map(r => `<tr><td>#${r.orderId}</td><td><span class="${r.status === 'delivered' ? 'text-success' : r.status === 'picked' ? 'text-warning' : 'text-info'}">${r.status}</span></td><td>${r.status === 'assigned' ? `<button class="btn-sm primary" onclick="pickupDelivery(${r.id})">Pickup</button>` : ''}${r.status === 'picked' ? `<button class="btn-sm success" onclick="deliverOrder(${r.id})">Deliver</button>` : ''}</td></tr>`).join('')}</tbody></table>`;
}

// ---- EARNINGS ----
function renderDeliveryEarnings(container, deliveryPerson) {
    const totalEarnings = deliveryPerson.earnings || 0;
    const balance = deliveryPerson.balance || 0;
    const deliveries = deliveryRequests.filter(r => r.deliveryPersonId === deliveryPerson.id && r.status === 'delivered');
    container.innerHTML = `
        <div class="dash-stats">
            <div class="stat-box"><div class="num">${deliveries.length}</div><div class="label">Deliveries Completed</div></div>
            <div class="stat-box"><div class="num">${formatPrice(totalEarnings)}</div><div class="label">Total Earnings</div></div>
            <div class="stat-box"><div class="num">${formatPrice(balance)}</div><div class="label">Available Balance</div></div>
        </div>
        <h4>Transaction History</h4>
        ${deliveries.length ? `<table><thead><tr><th>Order #</th><th>Fee</th><th>Date</th></tr></thead><tbody>${deliveries.map(r => `<tr><td>#${r.orderId}</td><td>${formatPrice(orders.find(o => o.id === r.orderId)?.deliveryFee || 0)}</td><td>${new Date(r.deliveredAt).toLocaleDateString()}</td></tr>`).join('')}</tbody></table>` : '<p>No completed deliveries.</p>'}
    `;
}

// ---- WITHDRAWALS ----
function renderDeliveryWithdrawals(container, deliveryPerson) {
    const withdrawals = deliveryPerson.withdrawals || [];
    const balance = deliveryPerson.balance || 0;
    container.innerHTML = `
        <h4 style="margin-bottom:10px;">Withdrawals</h4>
        <p><strong>Available Balance:</strong> ${formatPrice(balance)}</p>
        <button class="btn-sm primary" style="margin:10px 0;" onclick="openDeliveryWithdrawModal()"><i class="fas fa-hand-holding-usd"></i> Request Withdrawal</button>
        ${withdrawals.length ? `<table><thead><tr><th>Amount</th><th>Account</th><th>Status</th><th>Date</th></tr></thead><tbody>${withdrawals.map(w => `<tr><td>${formatPrice(w.amount)}</td><td>${w.accountDetails}</td><td><span class="${w.status === 'approved' ? 'text-success' : w.status === 'rejected' ? 'text-danger' : 'text-warning'}">${w.status}</span></td><td>${new Date(w.requestedAt).toLocaleDateString()}</td></tr>`).join('')}</tbody></table>` : '<p>No withdrawal requests yet.</p>'}
    `;
}
function openDeliveryWithdrawModal() {
    document.getElementById('deliveryWithdrawModalTitle').textContent = 'Request Withdrawal';
    document.getElementById('deliveryWithdrawForm').onsubmit = submitDeliveryWithdrawal;
    openModal('deliveryWithdrawModal');
}
function submitDeliveryWithdrawal(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('deliveryWithdrawAmount').value);
    const accountDetails = document.getElementById('deliveryWithdrawAccount').value.trim();
    const accountName = document.getElementById('deliveryWithdrawName').value.trim();
    if (!amount || amount < 1000) { toast('error', 'Minimum amount 1000 UGX.'); return; }
    if (!accountDetails || !accountName) { toast('error', 'Account details required.'); return; }
    const deliveryPerson = deliveryPersons.find(d => d.email === currentUser.email);
    if (!deliveryPerson) { toast('error', 'Delivery person not found.'); return; }
    if (amount > deliveryPerson.balance) { toast('error', 'Insufficient balance.'); return; }
    const withdrawal = { id: Date.now(), amount, accountDetails, accountName, status: 'pending', requestedAt: new Date().toISOString() };
    if (!deliveryPerson.withdrawals) deliveryPerson.withdrawals = [];
    deliveryPerson.withdrawals.push(withdrawal);
    deliveryPerson.balance -= amount;
    addNotification('admin', 'New Delivery Withdrawal Request', `${deliveryPerson.fullName} requested ${formatPrice(amount)}.`, 'warning');
    toast('success', 'Withdrawal request submitted.'); closeModal('deliveryWithdrawModal'); saveState(); switchDashTab('withdrawals');
}

// ---- PROFILE ----
function renderDeliveryProfile(container, deliveryPerson) {
    container.innerHTML = `<h4>Delivery Profile</h4><div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; max-width:500px;"><div><strong>ID</strong><br>${deliveryPerson.uniqueId}</div><div><strong>Name</strong><br>${deliveryPerson.fullName}</div><div><strong>Phone</strong><br>${deliveryPerson.phone}</div><div><strong>Vehicle</strong><br>${deliveryPerson.vehicleType} ${deliveryPerson.vehicleModel}</div><div><strong>License</strong><br>${deliveryPerson.licenseNumber}</div><div><strong>Permit</strong><br>${deliveryPerson.permitNumber}</div><div style="grid-column:1/-1;"><strong>Status</strong><br><span class="status-badge approved">✓ Approved</span></div></div><button class="btn-sm danger" onclick="signOut()">Sign Out</button>`;
}

// ---- DELIVERY ACTIONS ----
function pickupDelivery(requestId) {
    const request = deliveryRequests.find(r => r.id === requestId);
    if (!request) { toast('error', 'Request not found.'); return; }
    request.status = 'picked'; request.pickedAt = new Date().toISOString();
    const order = orders.find(o => o.id === request.orderId);
    if (order) order.status = 'picked';
    toast('success', 'Order picked up.'); saveState(); renderDashboard();
}
function deliverOrder(requestId) {
    const request = deliveryRequests.find(r => r.id === requestId);
    if (!request) { toast('error', 'Request not found.'); return; }
    request.status = 'delivered'; request.deliveredAt = new Date().toISOString();
    const order = orders.find(o => o.id === request.orderId);
    if (order) order.status = 'delivered';
    const deliveryPerson = deliveryPersons.find(d => d.id === request.deliveryPersonId);
    if (deliveryPerson && order.deliveryFee) {
        deliveryPerson.balance = (deliveryPerson.balance || 0) + order.deliveryFee;
        deliveryPerson.earnings = (deliveryPerson.earnings || 0) + order.deliveryFee;
    }
    addNotification(order.customerEmail, 'Order Delivered', `Order #${order.id} delivered.`, 'success');
    addNotification('admin', 'Order Delivered', `Order #${order.id} delivered.`, 'info');
    toast('success', 'Order delivered successfully.'); saveState(); renderDashboard();
}