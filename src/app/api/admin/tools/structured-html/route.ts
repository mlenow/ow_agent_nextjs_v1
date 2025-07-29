// src/app/api/admin/tools/structured-html/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { clean_text } = await req.json();

    if (!clean_text) {
      return NextResponse.json({ error: 'Missing clean_text' }, { status: 400 });
    }

    const systemPrompt = `You are helping build a job search assistant. Given company career page text, extract structured hiring data.`;

    const userPrompt = `Cleaned Text:
"""
${clean_text}
"""

Answer:
1. Is the company hiring? (yes/no)
2. List all job titles mentioned.
3. Summarize any pay or benefits info.
4. Write a 1-paragraph hiring summary for job seekers.`;

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
    });

    const structured_summary = chatResponse.choices[0].message.content?.trim();

    return NextResponse.json({ structured_summary });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ structured-html error:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}