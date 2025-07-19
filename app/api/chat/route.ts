import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  console.log(`[${new Date().toISOString()}] Received chat request`);
  
  const { messages } = await req.json();
  
  // Log the user's last message
  if (messages.length > 0) {
    const lastUserMessage = messages[messages.length - 1].content;
    console.log(`[${new Date().toISOString()}] User message: ${lastUserMessage.substring(0, 100)}...`);
  }
  
  const startTime = Date.now();
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert messages to history format for the chat session
    const history = messages.slice(0, -1).map((message: any) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }],
    }));

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    systemInstruction: {
      role: "model",
      parts: [{
        text: `You are Lexi, an AI Legal Assistant for the LexiPro platform. Format responses using Markdown for better readability. Use:
- **Bold** for key legal terms
- Lists for multiple points
- Clear section headings
- Proper paragraph breaks

Key guidelines:
1. Always emphasize that advice is AI-generated and not professional legal counsel
2. Focus on Indian legal context
3. Break complex concepts into digestible points
4. Use examples where helpful
5. Highlight important warnings/caveats`
        }]
      }
    });

    const userMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessageStream(userMessage);

    // Create a readable stream
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(encoder.encode(chunkText));
        }
        controller.close();
      },
    });

    const endTime = Date.now();
    console.log(`[${new Date().toISOString()}] Response generated in ${endTime - startTime}ms`);
    
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] API error:`, error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to get response from Gemini' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
