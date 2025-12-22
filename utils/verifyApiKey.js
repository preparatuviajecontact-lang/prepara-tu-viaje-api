import { projectId } from "../src/config/config.js";

export const verifyApiKey = async (apiKey) => {

    const documentPath = `companies/company_${apiKey}`;

    try {
        const response = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${documentPath}`
        );

        const data = await response.json();

        if (!data.fields) {
            const result = {
                valid: false,
                reason: "API Key no encontrada"
            };
            return result;
        }

        const fields = data.fields;

        const usage = Number(fields.usage.integerValue);
        const limit = Number(fields.limit.integerValue);
        const active = fields.active.booleanValue;

        let result;

        if (!active) {
            result = { valid: false, reason: "API Key desactivada" };
        } else if (usage >= limit) {
            result = { valid: false, reason: "Límite excedido" };
        } 
        else {
            result = {
                valid: true,
                plan: fields.plan.stringValue,
                usage,
                limit,
            };
        }

        return result;

    } catch (error) {
        return {
            valid: false,
            reason: "Error interno", error
        };
    }
};
