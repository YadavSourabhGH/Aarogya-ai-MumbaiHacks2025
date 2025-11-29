const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const fileToGenerativePart = (buffer, mimeType) => {
    return {
        inlineData: {
            data: buffer.toString('base64'),
            mimeType,
        },
    };
};

const extractJSON = (text) => {
    try {
        // 1. Try finding the first '{' and the last '}'
        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');

        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            const jsonStr = text.substring(firstOpen, lastClose + 1);
            try {
                return JSON.parse(jsonStr);
            } catch (e) {
                // If direct parse fails, try sanitizing control characters
                const sanitized = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
                return JSON.parse(sanitized);
            }
        }

        // 2. Fallback: Remove markdown code blocks
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("JSON Extraction Failed:", error);
        console.error("Problematic Text:", text); // Log the text for debugging
        throw error;
    }
};

const analyzeHealthData = async (patientData, imageBuffers) => {
    // For MVP, we use gemini-2.5-flash as requested.
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You are an expert oncologist and medical AI assistant. Analyze the following patient data to detect early signs of cancer.
    
    Patient Profile:
    ${JSON.stringify(patientData.profile, null, 2)}

    Medical Documents & Reports:
    ${JSON.stringify(patientData.documents, null, 2)}

    The patient has also provided medical images (X-rays, CT scans, or reports).

    Based on the text data and the attached images, provide a detailed analysis in the following JSON format ONLY. 
    Ensure all fields are present.

    {
      "overallRiskScore": <number 0-100>,
      "cancerStage": "<string, e.g., Stage I, Stage II, Stage III, Stage IV, or 'Not Detected'>",
      "organRisks": {
        "lung": { "score": <number 0-100>, "explanation": "..." },
        "breast": { "score": <number 0-100>, "explanation": "..." },
        "oral": { "score": <number 0-100>, "explanation": "..." },
        "colorectal": { "score": <number 0-100>, "explanation": "..." },
        "prostate": { "score": <number 0-100>, "explanation": "..." },
        "skin": { "score": <number 0-100>, "explanation": "..." },
        "liver": { "score": <number 0-100>, "explanation": "..." },
        "cervical": { "score": <number 0-100>, "explanation": "..." }
      },
      "shapExplanation": "<string, detailed explanation of WHY the score is what it is. Cite specific factors like 'Smoking history (+10%)', 'Mass in X-ray (+40%)'>",
      "recommendations": ["<string>", "<string>"],
      "nextSteps": "<string, recommended next steps>",
      "clinicReferrals": [
        { "name": "City Cancer Centre", "specialty": "Oncology", "location": "Downtown", "contact": "555-0123" },
        { "name": "General Hospital", "specialty": "Radiology", "location": "Westside", "contact": "555-0124" }
      ]
    }
    
    Do not include markdown formatting like \`\`\`json. Just return the raw JSON string.
  `;

    const parts = [prompt];

    if (imageBuffers && imageBuffers.length > 0) {
        imageBuffers.forEach(img => {
            parts.push(fileToGenerativePart(img.buffer, img.mimeType));
        });
    }

    try {
        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();
        return extractJSON(text);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw new Error('Failed to analyze data with AI');
    }
};

const generateHealthPlan = async (profile, documents) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    You are a personalized health AI agent. Create a diet plan and checkup schedule for a patient based on their profile and medical history.

    Patient Profile:
    ${JSON.stringify(profile, null, 2)}

    Medical History & Reports:
    ${JSON.stringify(documents, null, 2)}

    Return a JSON object with the following structure ONLY:
    {
        "dietPlan": [
            { "meal": "Breakfast", "items": ["..."], "calories": 300, "notes": "..." },
            { "meal": "Lunch", "items": ["..."], "calories": 500, "notes": "..." },
            { "meal": "Dinner", "items": ["..."], "calories": 400, "notes": "..." },
            { "meal": "Snacks", "items": ["..."], "calories": 150, "notes": "..." }
        ],
        "checkupSchedule": [
            { "testName": "...", "frequency": "...", "reason": "...", "priority": "High/Medium/Low" }
        ]
    }
    
    Do not include markdown formatting.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return extractJSON(text);
    } catch (error) {
        console.error("Gemini Health Plan Error:", error);
        return null; // Return null on failure so we don't crash
    }
};

module.exports = {
    analyzeHealthData,
    generateHealthPlan
};
