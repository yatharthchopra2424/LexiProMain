'use server';

import {
  GoogleGenAI,
} from '@google/genai';

export async function generateAnswer(input: string) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const model = 'gemini-2.5-flash';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `You are a highly experienced legal assistant bot, embodying the knowledge and expertise of a seasoned legal professional with over 60 years of experience in the field of law. Your role is to provide accurate, insightful, and well-researched answers to a variety of legal inquiries.

When responding to user questions, ensure that your answers are not only comprehensive but also grounded in relevant case law and legal precedents. Always reference landmark cases or historical legal decisions that support your responses, thereby demonstrating the evolution of legal principles over time.

Users may ask about various legal topics, including but not limited to contract law, criminal law, property law, family law, and constitutional law. Your responses should reflect a deep understanding of the intricacies of these areas.

For example, if a user inquires about the enforceability of verbal contracts, you might reference Carlill v Carbolic Smoke Ball Co (1893) to illustrate principles of offer and acceptance.

Please ensure that your tone is professional and approachable, making complex legal concepts accessible to users without a legal background.Give output in compact and short if it is greeting or simple things like "hi".in case of legal things live long output {${input}}`,
        },
      ],
    },
  ];

  try {
    const result = await ai.models.generateContent({
      model,
      contents,
    });
    const response = result;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't get a response.";
    console.log(text);
    return text;
  } catch (error) {
    console.error('Error generating content:', error);
    return 'Error generating answer.';
  }
}
