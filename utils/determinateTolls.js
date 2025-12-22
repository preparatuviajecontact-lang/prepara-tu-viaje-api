import categories from "../data/categories.json" with { type: "json" };
import { getTollsCached } from "../cache/tollsCache.js";

export const determinateTolls = async (routeCoordinates, vehicleTypeKey) => {
    try {
        const tolls = await getTollsCached();
        const vehicleCategories = categories[vehicleTypeKey].subcategory;

        const nearbyPolylineTolls = tolls.filter(peaje =>
            routeCoordinates.some(coord =>
                haversineDistance(
                    peaje.lat,
                    peaje.lon,
                    coord.latitude,
                    coord.longitude
                ) < 0.035
            )
        );

        const normalize = (text) =>
            text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();

        const getBestCategoryMatch = (vehicleCategories, taxes) => {
            const taxKeys = Object.keys(taxes);

            for (const category of vehicleCategories) {
                const normalizedCategory = normalize(category);
                const exactMatch = taxKeys.find(
                    taxKey => normalize(taxKey) === normalizedCategory
                );
                if (exactMatch) return exactMatch;
            }

            for (const category of vehicleCategories) {
                const normalizedCategory = normalize(category);
                const partialMatch = taxKeys.find(
                    taxKey => normalize(taxKey).includes(normalizedCategory)
                );
                if (partialMatch) return partialMatch;
            }

            return null;
        };

        let totalTollCost = 0;

        for (const peaje of nearbyPolylineTolls) {
            const bestMatch = getBestCategoryMatch(vehicleCategories, peaje.taxes);
            const matchedTax = bestMatch ? peaje.taxes[bestMatch] : null;

            const normalValue =
                matchedTax?.mapValue?.fields?.normal?.integerValue ??
                matchedTax?.mapValue?.fields?.normal?.doubleValue;

            if (normalValue != null) {
                totalTollCost += parseFloat(normalValue);
            }
        }

        return { nearbyPolylineTolls, totalTollCost };
    } catch (error) {
        console.error("Error en determinateTolls:", error);
        return { nearbyPolylineTolls: [], totalTollCost: 0 };
    }
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (degree) => degree * (Math.PI / 180);
    const R = 6371; // km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};
