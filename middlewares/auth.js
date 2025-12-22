import { verifyApiKey } from '../utils/verifyApiKey.js';

export const authApiKey = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "API key requerida"
    });
  }

  const isValid = await verifyApiKey(apiKey);
  if (!isValid.valid) {
    return res.status(401).json({
      success: false,
      error: isValid.reason
    });
  }

  req.apiKey = apiKey;
  next();
};
