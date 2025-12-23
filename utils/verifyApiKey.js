import { projectId } from "../src/config/config.js";

export const verifyApiKey = async (apiKey, companyId) => {
    const documentPath = `companies/company_${companyId}`;

    try {
        const response = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${documentPath}`
        );

        const data = await response.json();

        if (!data.fields) {
            return { valid: false, reason: "Empresa no encontrada" };
        }

        const fields = data.fields;

        // Verificar que la apiKey coincide
        if (!fields.apiKey || fields.apiKey.stringValue !== apiKey) {
            return { valid: false, reason: "API Key inválida" };
        }

        const usage = Number(fields.usage.integerValue || 0);
        const limit = Number(fields.limit.integerValue || 0);
        const active = fields.active.booleanValue;

        if (!active) {
            return { valid: false, reason: "API Key desactivada" };
        }

        if (usage >= limit) {
            return { valid: false, reason: "Límite excedido" };
        }

        return {
            valid: true,
            plan: fields.plan.stringValue,
            usage,
            limit,
        };

    } catch (error) {
        return {
            valid: false,
            reason: "Error interno",
            error: error.message
        };
    }
};
