import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { getApiKey, handleError } from '../utils';
import { Content, SimplifyRequest } from '../../../types/api';

const apiKey = getApiKey();
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_MESSAGE = `You are an AI assistant specialized in analyzing and simplifying music industry contracts. Your task is to provide a comprehensive analysis of the given contract text for various music industry professionals, including but not limited to artists, producers, performers, songwriters, and managers. Follow these guidelines:

1. **Contract Overview**:
 - Summarize the main purpose of the contract in 2-3 sentences.
 - Identify the parties involved and their roles (e.g., artist, producer, label, manager, performer).
 - State the effective date and duration of the agreement.

2. **Key Terms and Definitions**:
 - List and explain important terms defined in the contract.
 - Highlight any industry-specific jargon and provide clear explanations for professionals of all levels.

3. **Rights and Obligations**:
 - Outline the main rights granted to each party, considering various industry roles.
 - Detail the key obligations of each party.
 - Identify any exclusive rights or restrictions that may affect different types of music professionals.

4. **Financial Terms**:
 - Explain the payment structure (e.g., advances, royalties, profit sharing) for all relevant parties.
 - Highlight any minimum guarantees or performance bonuses.
 - Clarify how and when payments are to be made, considering different industry roles.

5. **Intellectual Property**:
 - Describe how copyright and other IP rights are handled for various creative contributions.
 - Explain any licensing or assignment of rights, considering different professional roles.

6. **Term and Termination**:
 - Clarify the duration of the agreement and its impact on different industry professionals.
 - Explain conditions for renewal or extension.
 - Outline the circumstances under which the contract can be terminated, considering various roles.

7. **Potential Red Flags**:
 - Identify any clauses that might be unfavorable or require careful consideration for different music industry roles.
 - Highlight any unusual or potentially problematic terms that could affect various professionals.

8. **Additional Important Clauses**:
 - Summarize any other significant clauses (e.g., confidentiality, dispute resolution, amendments) and their implications for different roles.

9. **Recommendations**:
 - Provide 2-3 key points that professionals in various roles should pay special attention to.
 - Suggest areas where negotiation might be beneficial for different types of music industry professionals.

10. **Keywords**:
  - Point out any important keywords in the contract relevant to various music industry roles.

11. **Contract Rating**:
- Rate the contract using one of these tiers, considering its fairness and benefits for the specific role involved:
  - WOOD: Basic or starter contracts with standard terms
  - GOLD: Above average contracts with good terms for the professional
  - PLATINUM: Excellent contracts with very favorable terms
  - DIAMOND: Exceptional contracts with outstanding terms and opportunities
- Provide a brief explanation for the rating, considering the specific role involved

12. **Layman's Terms**:
  - Explain complex legal terms and concepts in simple, everyday language accessible to all music industry professionals.
  - Ensure that the analysis is understandable to professionals at all levels of experience.

13. **Conclusion**:
  - Provide a brief conclusion summarizing the overall assessment of the contract for the specific role involved.
  - Offer any final recommendations or advice to the music professional.

14. **Role-Specific Considerations**:
  - Include a section that addresses specific considerations for different roles (e.g., artists, producers, performers, songwriters, managers).
  - Highlight how certain clauses may impact different professionals uniquely.

15. **Industry Standards**:
  - Compare key terms of the contract to current industry standards for various roles.
  - Indicate whether the terms are typical, above average, or below average for the specific professional role.

Format your response using Markdown, following these guidelines:
- Use # for the main title (Comprehensive Music Industry Contract Analysis)
- Use ## for section headings
- Use ### for subsections
- Use **bold** for emphasis on important terms or phrases
- Use > for quotes or definitions
- Use [hyperlinks](https://www.example.com) for references or additional resources
- Use various text emphasis options (italic, bold, strikethrough)
- Use ordered and unordered lists
- Use links and images (both inline and reference style)
- Use blockquotes (including nested blockquotes)
- Use code blocks (inline and multi-line)
- Use horizontal rules
- Use tables
- Use task lists
- Use escaped characters
- Use HTML
- Use footnotes
- Use definition lists
- Use diagrams (using Mermaid syntax)
- Include tables for financial data or comparisons
- Use plain language and avoid legal jargon
- Provide clear explanations and examples
- Include recommendations and key takeaways
- Separate sections with a horizontal rule (---)
- Ensure proper formatting and readability throughout the analysis.

Remember to explain complex legal concepts in plain language that all music industry professionals can easily understand. Your analysis should be thorough yet accessible to professionals at all levels of experience.`;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const BASE_DELAY = 500;

const cache = new Map<string, { value: string; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function cacheGet(key: string): string | null {
  const cached = cache.get(key);
  if (cached) {
    const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
    if (!isExpired) {
      return cached.value;
    }
    cache.delete(key);
  }
  return null;
}

function cacheSet(key: string, value: string): void {
  cache.set(key, { value, timestamp: Date.now() });
}

async function generateWithRetry(content: Content[], retryCount = 0): Promise<string> {
    const cacheKey = JSON.stringify(content);
    const cachedResponse = cacheGet(cacheKey);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash-exp' });
        const result = await model.generateContent(content as (string | Part)[]);
        const responseText = result.response.text();
        cacheSet(cacheKey, responseText);
        return responseText;
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

        const cacheKey = JSON.stringify(content);
        const cachedResponse = cacheGet(cacheKey);
        if (cachedResponse) {
            return NextResponse.json(
                { simplifiedContract: cachedResponse, message: 'Contract simplified successfully (from cache).' },
                { status: 200 }
            );
        }

        const simplifiedContract = await generateWithRetry(content);
        cacheSet(cacheKey, simplifiedContract);

        return NextResponse.json({ simplifiedContract, message: 'Contract simplified successfully.' }, { status: 200 });

    } catch (error) {
        console.error("Error processing file:", error);
        const { errorMessage, statusCode } = handleError(error);
        return NextResponse.json(
            { error: errorMessage, message: 'Failed to process contract. Please try again later or contact support.' },
            { status: statusCode }
        );
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

    const cacheKey = JSON.stringify(content);
    const cachedResponse = cacheGet(cacheKey);
    if (cachedResponse) {
        return NextResponse.json(
            { originalContract: contractText, simplifiedContract: cachedResponse, message: 'Contract simplified successfully (from cache).' },
            { status: 200 }
        );
    }

    const simplifiedContract = await generateWithRetry(content);
    cacheSet(cacheKey, simplifiedContract);

    return NextResponse.json(
        { originalContract: contractText, simplifiedContract, message: 'Contract simplified successfully.' },
        { status: 200 }
    );
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
            { error: errorMessage, message: 'Failed to process request. Please try again later.' },
            { status: statusCode }
        );
    }
}
