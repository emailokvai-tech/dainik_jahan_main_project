import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contents, model, systemInstruction } = body;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const configObj: any = {};
    if (systemInstruction) {
        configObj.systemInstruction = systemInstruction;
    }

    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents,
      config: configObj
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('AI API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
