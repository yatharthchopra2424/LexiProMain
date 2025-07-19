import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { caseType, caseDescription, relevantLaws, prediction } = await req.json();

    const expansionPrompt = `
You are a legal AI assistant. Provide a concise and direct outcome and prediction for the following case, in text-only format.

**Case Details**:
- **Type**: ${caseType}
- **Description**: ${caseDescription}
- **Relevant Laws**: ${relevantLaws || "Not provided"}
- **Initial Prediction**: ${prediction}

**Instructions**:
1.  Generate a compact analysis of the legal standing.
2.  Keep the output direct and to the point.
3.  Do not use markdown or any special formatting.
4.  Focus on the core legal issue and potential outcome.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: expansionPrompt,
          }],
        }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Gemini API error:', errorBody);
      throw new Error('Failed to expand analysis');
    }

    const data = await response.json();
    const expandedAnalysis = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ expandedAnalysis });
  } catch (error) {
    console.error('Error expanding prediction:', error);
    return NextResponse.json({ 
      error: 'Failed to expand analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
