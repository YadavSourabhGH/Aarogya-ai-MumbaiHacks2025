const { GoogleGenerativeAI } = require('@google/generative-ai');
const stream = require('stream');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const bufferFromStream = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (err) => reject(err));
    });
};

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
        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            const jsonStr = text.substring(firstOpen, lastClose + 1);
            return JSON.parse(jsonStr);
        }
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        throw error;
    }
};

const extractText = async (fileId, mimeType, gridfsBucket) => {
    const downloadStream = gridfsBucket.openDownloadStream(fileId);
    const buffer = await bufferFromStream(downloadStream);

    // For plain text/JSON, we can just read it directly
    if (mimeType === 'text/plain' || mimeType === 'application/json') {
        const content = buffer.toString('utf-8');
        return { text: content, structuredData: {} };
    }

    // For Images and PDFs, use Gemini
    if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
        try {
            // Use the requested Gemini 2.5 Flash model
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `
                Analyze this document. 
                1. Extract all the visible text verbatim.
                2. Extract any structured data such as patient details, lab results, dates, and medical values.
                
                Return the result as a valid JSON object with the following structure:
                {
                    "text": "Full extracted text content...",
                    "summary": "A concise 2-3 sentence summary of the document's key medical findings...",
                    "structuredData": {
                        "patientName": "...",
                        "date": "...",
                        "labResults": { ... },
                        ... any other identified fields
                    }
                }
                
                Do not include markdown formatting like \`\`\`json. Just return the raw JSON string.
            `;
            const imagePart = fileToGenerativePart(buffer, mimeType);

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const textResponse = response.text();

            try {
                return extractJSON(textResponse);
            } catch (e) {
                console.error("Failed to parse Gemini JSON response", e);
                // Fallback: return object with just text if parsing fails
                return { text: textResponse, structuredData: {} };
            }
        } catch (error) {
            console.error("Gemini Extraction Error:", error);
            return { text: `[Error extracting text with AI: ${error.message}]`, structuredData: {} };
        }
    }

    return { text: '', structuredData: {} };
};

module.exports = {
    extractText
};
