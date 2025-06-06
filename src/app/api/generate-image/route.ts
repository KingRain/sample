import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
async function saveImageToSupabase(content: Buffer): Promise<{ url: string }> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fileName = `${uuidv4()}.png`;
    const bucketName = 'images';
    const filePath = `generated/${fileName}`;

    try {
        const { error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, content, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) throw error;

        const { data, error: signedError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(filePath, 3600); // 1 hour expiration

        if (signedError) throw signedError;
        if (!data) throw new Error('Failed to create signed URL');

        return { url: data.signedUrl };
    } catch (error) {
        console.error('Error uploading to Supabase:', error);
        throw error;
    }
}

async function generateImage(prompt: string): Promise<{ imageUrl: string }> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('❌ GEMINI_API_KEY is missing from environment variables.');
    }

    const ai = new GoogleGenAI({ apiKey });
    const config = {
        responseModalities: ['IMAGE', 'TEXT'],
        responseMimeType: 'text/plain',
    };

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

    let imageUrl = '';
    
    for await (const chunk of response) {
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
            const inlineData = chunk.candidates[0].content.parts[0].inlineData;
            const buffer = Buffer.from(inlineData.data || '', 'base64');
            const { url } = await saveImageToSupabase(buffer);
            imageUrl = url;
            break; // Only need the first image
        }
    }

    return {
        imageUrl
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
    console.log(response);
    return NextResponse.json(response);
}