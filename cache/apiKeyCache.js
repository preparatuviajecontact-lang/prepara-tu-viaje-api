const apiKeyCache = new Map();

// tiempo de vida del cache (ej: 5 minutos)
const CACHE_TTL = 5 * 60 * 1000;

export const getCachedApiKey = (apiKey) => {
    const cached = apiKeyCache.get(apiKey);

    if (!cached) return null;

    // si expiró, eliminar
    if (Date.now() > cached.expiresAt) {
        apiKeyCache.delete(apiKey);
        return null;
    }

    return cached.data;
};

export const setCachedApiKey = (apiKey, data) => {
    apiKeyCache.set(apiKey, {
        data,
        expiresAt: Date.now() + CACHE_TTL
    });
};
