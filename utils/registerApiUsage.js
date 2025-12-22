import { projectId } from "../src/config/config.js";

export const registerApiUsage = async (apiKey) => {
    const documentPath = `projects/${projectId}/databases/(default)/documents/companies/company_${apiKey}`;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                writes: [
                    {
                        transform: {
                            document: documentPath,
                            fieldTransforms: [
                                {
                                    fieldPath: "usage",
                                    increment: {
                                        integerValue: "1"
                                    }
                                }
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