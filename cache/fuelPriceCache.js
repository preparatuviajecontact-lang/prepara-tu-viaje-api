const fuelCache = new Map();

// TTL 6 horas
const FUEL_TTL = 6 * 60 * 60 * 1000;

export const getCachedFuelPrices = (regionCode) => {
    const cached = fuelCache.get(regionCode);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
        fuelCache.delete(regionCode);
        return null;
    }

    return cached.data;
};

export const setCachedFuelPrices = (regionCode, data) => {
    fuelCache.set(regionCode, {
        data,
        expiresAt: Date.now() + FUEL_TTL
    });
};
