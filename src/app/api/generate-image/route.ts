import { GoogleGenAI } from '@google/genai';
import { writeFile } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
function saveBinaryFile(content: Buffer): { filePath: string } {
    const fileName = `${uuidv4()}.png`;
    const filePath = `/generated/${fileName}`;
    const folderPath = path.join(process.cwd(), 'public', 'generated');
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    const fullPath = path.join(folderPath, fileName);
    writeFile(fullPath, content, (err) => {
        if (err) {
            console.error(`Error writing file ${fileName}:`, err);
            return;
        }
        console.log(`File ${fileName} saved to file system at ${fullPath}.`);
    });
    return { filePath };
}

export async function generateImage(prompt: string) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('❌ GEMINI_API_KEY is missing from environment variables.');
    }

    const ai = new GoogleGenAI({ apiKey });
    const config = {
        responseModalities: ['IMAGE', 'TEXT'],
        responseMimeType: 'text/plain',
    }

    const model = 'gemini-2.0-flash-preview-image-generation';
    const contents = [
        {
            parts: [
                {
                    text: prompt,
                },
            ],
        },
    ];

    const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
    });

    for await (const chunk of response) {
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
            const inlineData = chunk.candidates[0].content.parts[0].inlineData;
            const buffer = Buffer.from(inlineData.data || '', 'base64');
            const { filePath } = saveBinaryFile(buffer);
            return {
                fileName: filePath
            };
        }
    }

    return {
        fileName: ''
    };
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const prompt = body.prompt;
    if (!prompt) {
        return NextResponse.json({
            message: 'No prompt provided',
            status: 400
        });
    }
    const response = await generateImage(prompt);
    return NextResponse.json(response);
}