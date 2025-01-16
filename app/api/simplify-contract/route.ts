import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { getApiKey, handleError } from '../utils';

const apiKey = getApiKey();
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_MESSAGE = `You are an AI assistant specializing in simplifying and analyzing music industry contracts for professionals such as artists, producers, performers, songwriters, and managers. Your task is to provide a detailed, easy-to-understand analysis of the given contract, adhering to these guidelines:

1. **Contract Overview**:
   - Summarize the contract’s purpose in 2-3 sentences.
   - Identify the parties involved and their roles.
   - State the effective date and duration.

2. **Key Terms**:
   - List and explain important terms and definitions, including industry-specific jargon.

3. **Rights and Obligations**:
   - Outline rights and duties for all parties.
   - Highlight exclusivity, restrictions, and their impact on professionals.

4. **Financial Terms**:
   - Explain payment structures (e.g., advances, royalties).
   - Detail minimum guarantees, bonuses, and payment schedules.

5. **Intellectual Property**:
   - Describe IP ownership, licensing, and rights assignment.

6. **Term and Termination**:
   - Clarify duration, renewal, and termination conditions.

7. **Red Flags**:
   - Identify unfavorable or unusual clauses for any role.

8. **Additional Clauses**:
   - Summarize other key clauses like confidentiality or dispute resolution.

9. **Contract Rating**:
   - Rate the contract as WOOD, GOLD, PLATINUM, or DIAMOND based on fairness, with a brief explanation.

10. **Layman's Terms**:
    - Simplify complex legal terms for all experience levels.

11. **Role-Specific Considerations**:
    - Highlight unique impacts on different roles.

**Format**:
- Use Markdown for structure: titles, headings, bold/italic text, tables, blockquotes, code blocks, and diagrams (Mermaid syntax).
- Keep analysis clear, concise, and accessible for all professionals.
- Include recommendations, examples, and key takeaways.

Focus on clarity, readability, and practical insights for all music industry professionals.`

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const BASE_DELAY = 500;

interface Content {
    inlineData?: {
        data: string;
        mimeType: string;
    };
    text?: string;
}

interface SimplifyRequest {
    contractText: string;
}

async function generateWithRetry(content: Content[], retryCount = 0): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash-exp' });
        const result = await model.generateContent(content as (string | Part)[]);
        return result.response.text();
    } catch (error: unknown) {
        if (error instanceof Error && (error as { status?: number }).status && ((error as unknown as { status: number }).status === 429 || (error as unknown as { status: number }).status === 503) && retryCount < MAX_RETRIES) {
            const waitTime = BASE_DELAY * Math.pow(2, retryCount);
            console.log(`Service unavailable. Retrying in ${waitTime}ms...`);
            await delay(waitTime);
            return generateWithRetry(content, retryCount + 1);
        }
        throw error;
    }
}

const handleMultipartFormData = async (req: NextRequest) => {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    try {
        let fileContent: string;
        if (file.type === 'application/pdf') {
            const fileBuffer = await file.arrayBuffer();
            fileContent = Buffer.from(fileBuffer).toString('base64');
        } else if (file.type === 'text/plain') {
            fileContent = await file.text();
        } else {
            return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or TXT file.' }, { status: 400 });
        }

        const content: Content[] = [
            { text: SYSTEM_MESSAGE },
            { text: fileContent },
        ];

        const simplifiedContract = await generateWithRetry(content);
        return NextResponse.json({ simplifiedContract }, { status: 200 });

    } catch (error) {
        console.error("Error processing file:", error);
        return NextResponse.json({ error: 'Failed to process contract. Please try again later or contact support.' }, { status: 500 });
    }
};

const handleJsonRequest = async (req: NextRequest) => {
    const { contractText }: SimplifyRequest = await req.json();

    if (!contractText) {
        return NextResponse.json({ error: 'No contract text provided' }, { status: 400 });
    }

    const content: Content[] = [
        { text: contractText },
        { text: SYSTEM_MESSAGE },
        { text: 'Simplify this contract based on the instructions provided, and format the response using Markdown as specified.' },
    ];

    const simplifiedContract = await generateWithRetry(content);

    return NextResponse.json({ originalContract: contractText, simplifiedContract }, { status: 200 });
};

export async function POST(req: NextRequest) {
    try {
        if (req.headers.get('content-type')?.includes('multipart/form-data')) {
            return await handleMultipartFormData(req);
        } else if (req.headers.get('content-type') === 'application/json') {
            return await handleJsonRequest(req);
        } else {
            return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
        }
    } catch (error: unknown) {
        const { errorMessage, statusCode } = handleError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}