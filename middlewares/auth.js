import { verifyApiKey } from '../utils/verifyApiKey.js';

export const authApiKey = async (req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    const { companyId } = req.params;

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: "API key requerida"
        });
    }

    if (!companyId) {
        return res.status(400).json({
            success: false,
            error: "companyId requerido en la ruta"
        });
    }

    const isValid = await verifyApiKey(apiKey, companyId);

    if (!isValid.valid) {
        return res.status(401).json({
            success: false,
            error: isValid.reason
        });
    }

    req.apiKey = apiKey;
    req.companyId = companyId;
    next();
};
