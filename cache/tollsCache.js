import { projectId } from "../src/config/config.js";

let tollsCache = null;
let tollsCacheTimestamp = 0;

const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 horas

export const getTollsCached = async () => {
    const now = Date.now();

    if (tollsCache && (now - tollsCacheTimestamp < CACHE_TTL)) {
        return tollsCache;
    }

    const documentPath = "tollsData/CL_2025";

    const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${documentPath}`
    );

    const data = await response.json();

    if (!data.fields) {
        throw new Error("No se encontraron datos de peajes");
    }

    const tolls = [];

    for (const [id, field] of Object.entries(data.fields)) {
        const toll = field.mapValue.fields;

        tolls.push({
            id,
            name: toll.name?.stringValue || "",
            lat: parseFloat(toll.lat?.stringValue || "0"),
            lon: parseFloat(toll.lon?.stringValue || "0"),
            region: toll.region?.stringValue || "",
            route: toll.route?.stringValue || "",
            image: toll.images?.mapValue?.fields?.imagen1?.stringValue || "",
            taxes: toll.taxes?.mapValue?.fields || {},
            payment: toll.payment?.stringValue || "",
            dealership: toll.dealership?.stringValue || "",
        });
    }

    tollsCache = tolls;
    tollsCacheTimestamp = now;

    return tolls;
};
