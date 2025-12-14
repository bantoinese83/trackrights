import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  getApiKey,
  handleError,
  corsHeaders,
  cacheGet,
  cacheSet,
} from '../utils';
import type { Content } from '@/lib/types/api';
import { optimizeContractText } from '@/lib/utils/contract-optimizer';
import { generateWithRetry } from '@/lib/ai-retry';
import { validate, simplifyContractRequestSchema } from '@/lib/validation';

// Set max duration for Vercel serverless function (60 seconds)
export const maxDuration = 60;

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

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
  - Use real-time information from the web to reference current industry practices, recent legal precedents, and standard rates.
  - Indicate whether the terms are typical, above average, or below average for the specific professional role.
  - Cite sources when referencing industry standards or legal information.

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

// Helper function to generate content with caching
async function generateContent(content: Content[]): Promise<string> {
  const cacheKey = JSON.stringify(content);
  const cachedResponse = cacheGet(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  const contentArray = content.map((item) => item.text || '').filter(Boolean);
  const response = await generateWithRetry(ai, contentArray);

  cacheSet(cacheKey, response);
  return response;
}

// File upload validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'text/plain'];

const handleMultipartFormData = async (req: NextRequest) => {
  const reqUrl = req.nextUrl;
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { error: 'No file uploaded' },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit. Please upload a smaller file.`,
      },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Only PDF and TXT files are allowed.' },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  try {
    let fileContent: string;
    if (file.type === 'application/pdf') {
      const fileBuffer = await file.arrayBuffer();
      fileContent = Buffer.from(fileBuffer).toString('base64');
    } else if (file.type === 'text/plain') {
      fileContent = await file.text();
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or TXT file.' },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    // Optimize file content if it's text (PDFs are base64, don't optimize those)
    const optimizedContent =
      file.type === 'text/plain'
        ? optimizeContractText(fileContent, 12000)
        : fileContent;

    const content: Content[] = [
      { text: SYSTEM_MESSAGE },
      { text: optimizedContent },
    ];

    const startTime = Date.now();
    const simplifiedContract = await generateContent(content);
    const processingTimeMs = Date.now() - startTime;

    // Track contract analysis (non-blocking)
    fetch(`${reqUrl.origin}/api/track-contract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractText: fileContent,
        simplifiedText: simplifiedContract,
        processingTimeMs,
        contractType: 'simplify',
      }),
    }).catch(console.error);

    return NextResponse.json(
      { simplifiedContract, message: 'Contract simplified successfully.' },
      { status: 200, headers: corsHeaders(req) }
    );
  } catch (error) {
    return handleError(error, req);
  }
};

const handleJsonRequest = async (req: NextRequest) => {
  const reqUrl = req.nextUrl;

  try {
    const body = await req.json();
    const validated = await validate(simplifyContractRequestSchema, body);
    const { contractText } = validated;

    // Optimize contract text to reduce tokens while preserving important information
    const optimizedContract = optimizeContractText(contractText, 12000);

    const content: Content[] = [
      { text: optimizedContract },
      { text: SYSTEM_MESSAGE },
      {
        text: 'Simplify this contract based on the instructions provided, and format the response using Markdown as specified.',
      },
    ];

    const startTime = Date.now();
    const simplifiedContract = await generateContent(content);
    const processingTimeMs = Date.now() - startTime;

    // Track contract analysis (non-blocking)
    fetch(`${reqUrl.origin}/api/track-contract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractText,
        simplifiedText: simplifiedContract,
        processingTimeMs,
        contractType: 'simplify',
      }),
    }).catch(console.error);

    return NextResponse.json(
      {
        originalContract: contractText,
        simplifiedContract,
        message: 'Contract simplified successfully.',
      },
      { status: 200, headers: corsHeaders(req) }
    );
  } catch (error) {
    return handleError(error, req);
  }
};

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      return await handleMultipartFormData(req);
    } else if (contentType === 'application/json') {
      return await handleJsonRequest(req);
    } else {
      return NextResponse.json(
        {
          error:
            'Invalid content type. Expected multipart/form-data or application/json.',
        },
        { status: 400, headers: corsHeaders(req) }
      );
    }
  } catch (error: unknown) {
    return handleError(error, req);
  }
}
