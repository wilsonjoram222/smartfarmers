module.exports = (io) => {
    const activeUsers = new Map();

    io.on('connection', (socket) => {
        console.log('🔌 Client connected:', socket.id);

        socket.on('join', (userId) => {
            if (userId) {
                activeUsers.set(userId, socket.id);
                socket.join(`user_${userId}`);
                console.log(`👤 User ${userId} joined`);
            }
        });

        socket.on('join-admin', () => {
            socket.join('admin_room');
            console.log('👑 Admin joined');
        });

        socket.on('join-vendor', (vendorId) => {
            socket.join(`vendor_${vendorId}`);
            console.log(`🏪 Vendor ${vendorId} joined`);
        });

        socket.on('join-delivery', (deliveryId) => {
            socket.join(`delivery_${deliveryId}`);
            console.log(`🚚 Delivery ${deliveryId} joined`);
        });

        socket.on('location-update', (data) => {
            const { deliveryId, lat, lng, orderId } = data;
            socket.to(`user_${orderId}`).emit('delivery-location', { deliveryId, lat, lng, orderId });
            socket.to('admin_room').emit('delivery-location', { deliveryId, lat, lng, orderId });
        });

        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
            for (const [key, value] of activeUsers) {
                if (value === socket.id) {
                    activeUsers.delete(key);
                    break;
                }
            }
        });
    });

    // Helper functions
    const emitToUser = (userId, event, data) => {
        io.to(`user_${userId}`).emit(event, data);
    };
    const emitToAdmin = (event, data) => {
        io.to('admin_room').emit(event, data);
    };
    const emitToVendor = (vendorId, event, data) => {
        io.to(`vendor_${vendorId}`).emit(event, data);
    };
    const emitToDelivery = (deliveryId, event, data) => {
        io.to(`delivery_${deliveryId}`).emit(event, data);
    };

    return { emitToUser, emitToAdmin, emitToVendor, emitToDelivery };
};
