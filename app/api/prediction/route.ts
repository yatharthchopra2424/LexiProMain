import { NextResponse } from 'next/server';
import { InferenceClient } from '@huggingface/inference';

const hf = new InferenceClient(process.env.HF_TOKEN);

export async function POST(req: Request) {
  try {
    const { caseType, caseDescription, relevantLaws } = await req.json();

    const geminiPrompt = `Based on the following case details, create a single, concise sentence for the Legal-BERT model, ending with the "[MASK]" token.

Case Type: ${caseType}
Case Description: ${caseDescription}
Relevant Laws: ${relevantLaws}

The sentence should summarize the core legal question of the case. For example: "The central issue is whether the defendant's actions constitute a [MASK] of the contract."`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: geminiPrompt,
          }],
        }],
      }),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json();
      console.error('Error from Gemini API:', errorBody);
      throw new Error('Failed to get response from Gemini');
    }

    const geminiData = await geminiResponse.json();
    const text = geminiData.candidates[0].content.parts[0].text;

    const hfResponse = await hf.fillMask({
      model: 'nlpaueb/legal-bert-base-uncased',
      inputs: text,
    });

    return NextResponse.json({ hfResponse, geminiPrompt: text });
  } catch (error) {
    console.error('Error in prediction API:', error);
    return NextResponse.json({ error: 'Failed to get prediction' }, { status: 500 });
  }
}
