import { projectId } from "../src/config/config.js";

export const registerApiUsage = async (companyId) => {
    // Path del documento correcto
    const documentPath = `projects/${projectId}/databases/(default)/documents/companies/company_${companyId}`;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`;

    const now = new Date();
    const monthKey = `usage_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}`;
    const dayKey = String(now.getDate());

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                writes: [
                    {
                        // Transform asegura que solo actualiza campos existentes
                        transform: {
                            document: documentPath,
                            fieldTransforms: [
                                { fieldPath: "usage", increment: { integerValue: "1" } },
                                { fieldPath: `\`${monthKey}\`.\`${dayKey}\``, increment: { integerValue: "1" } }
                            ]
                        }
                    }
                ]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

    } catch (error) {
        console.error("registerApiUsage error:", error);
    }
};
