import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { getApiKey, handleError } from '../utils';

const apiKey = getApiKey();
const genAI = new GoogleGenerativeAI(apiKey);


const SYSTEM_MESSAGE = `You are an AI assistant specialized in analyzing and simplifying music industry contracts. Your task is to provide a concise analysis of the given contract text for various music professionals. Focus on key aspects like payment terms, intellectual property, rights and obligations, and potential red flags.  Prioritize brevity and clarity in your response.  Use markdown formatting for better readability.
`;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3; // Reduced retry attempts
const BASE_DELAY = 500; // Reduced base delay


interface Content {
    inlineData?: {
        data: string;
        mimeType: string;
    };
    text?: string;
}

async function generateWithRetry(content: Content[], retryCount = 0): Promise<string> {
    try {

      const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash-exp' }); // Moved model instantiation inside retry loop

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
    const { contractText } = await req.json();

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

