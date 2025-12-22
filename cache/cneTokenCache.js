let cachedToken = null;
let tokenExpiresAt = 0;

// TTL seguro (ej: 50 min)
const TOKEN_TTL = 50 * 60 * 1000;

export const getCachedCneToken = () => {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }
    return null;
};

export const setCachedCneToken = (token) => {
    cachedToken = token;
    tokenExpiresAt = Date.now() + TOKEN_TTL;
};
