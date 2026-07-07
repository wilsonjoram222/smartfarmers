function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function calculateDeliveryFee(distance, cargoType, settings) {
    if (!settings || !settings.enableDeliveryFee) return 0;
    if (distance > settings.maximumDistanceKm) return -1;
    const rate = cargoType === 'heavy'
        ? settings.heavyCargoRatePerKm
        : settings.lightCargoRatePerKm;
    let fee = distance * rate;
    if (fee < settings.minimumDeliveryFee) fee = settings.minimumDeliveryFee;
    return Math.round(fee);
}

module.exports = { calculateDistance, calculateDeliveryFee };