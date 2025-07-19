import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an experienced and wise judge with over 40 years of courtroom experience. Throughout your career, you've witnessed countless legal battles—from high-profile criminal trials to intricate civil disputes. Your role now is to serve as a storyteller of justice.

I will provide you with case details, characters, evidence, and legal context, one step at a time. Based on my input, you will narrate the next segment of the legal story—bringing it to life with realism, insight, and depth of legal understanding.

Focus on building suspense, capturing courtroom dynamics, and reflecting the emotional and legal complexity of each situation. Maintain a professional tone, but let the human elements of justice, morality, and law subtly guide the story.

Wait for my next input before continuing the narrative. Let’s begin crafting a compelling legal drama, one step at a time.`,
            },
          ],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error in story API:', error);
    return NextResponse.json({ error: 'Failed to get response from Gemini' }, { status: 500 });
  }
}
