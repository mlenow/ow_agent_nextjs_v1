// src/app/api/admin/tools/chat-agent/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/utils/db';
import { OpenAI } from 'openai';
import { buildApplyNowPrompt } from '@/lib/chat-agent/promptBuilder';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { company_id, user_input, chat_history } = await req.json();

    if (!company_id || !user_input) {
      return NextResponse.json({ error: 'Missing company_id or user_input' }, { status: 400 });
    }

    const pool = await getConnection();

    // 🔍 Fetch company page content
    const pageResult = await pool.request()
      .input('company_id', company_id)
      .query(`
        SELECT page_type, clean_text, structured_json
        FROM tbl_agent_company_pages
        WHERE company_id = @company_id AND clean_text IS NOT NULL
      `);

    const pageContent = pageResult.recordset;

    // 🧠 Parse structured JSON
    const structuredData: { structured_summary?: string }[] = pageContent
      .map((p: { structured_json: string | null }) => {
        try {
          return p.structured_json ? JSON.parse(p.structured_json) : null;
        } catch {
          return null;
        }
      })
      .filter((x): x is { structured_summary?: string } => Boolean(x));

    // ✅ Extract job titles and hiring status from structured_summary
    const allTitles: string[] = [];
    let hiringStatus = false;

    structuredData.forEach((data) => {
      const summary: string = data.structured_summary || '';
      const lines = summary.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line: string = lines[i].trim();

        if (
          line.toLowerCase().includes('is the company hiring') &&
          line.toLowerCase().includes('yes')
        ) {
          hiringStatus = true;
        }

        if (line.toLowerCase().includes('list all job titles mentioned')) {
          for (let j = i + 1; j < lines.length; j++) {
            const titleLine: string = lines[j].trim();
            if (titleLine === '' || /^\d\./.test(titleLine)) break;
            const match = titleLine.match(/[-•*]?\s*(.+)/);
            if (match && match[1]) allTitles.push(match[1].trim());
          }
        }
      }
    });

    // ✏️ Compose hiring message
    let hiringSummary = '';
    if (hiringStatus && allTitles.length > 0) {
      hiringSummary = `Welcome! We're currently hiring for: ${[...new Set(allTitles)].join(', ')}.`;
    } else if (hiringStatus) {
      hiringSummary = `Welcome! We're currently hiring and always excited to meet great people.`;
    } else {
      hiringSummary = `Welcome! We might not have openings listed right now, but we’re always open to connecting with people interested in working with us.`;
    }

    // 📚 Compile all clean_text content for grounding
    let companyContext = '';
    for (const page of pageContent) {
      const label = page.page_type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      companyContext += `\n[${label}]\n${page.clean_text.trim()}\n`;
    }

    // 🏢 Fetch company info
    const companyInfoResult = await pool.request()
      .input('id', company_id)
      .query(`
        SELECT name, naics_code, industry, primary_location
        FROM tbl_agent_companies
        WHERE id = @id
      `);

    if (companyInfoResult.recordset.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const {
      name: companyName,
      naics_code: naicsCode,
      industry,
      primary_location: primaryLocation
    } = companyInfoResult.recordset[0];

    // 💰 Use LLM to infer average wage
    let averageWage = 30;
    try {
      const wagePrompt = `
    You are a labor market assistant. Based on the following information, estimate the typical starting hourly wage in dollars.

    Industry: ${industry || 'Unknown'}
    NAICS Code: ${naicsCode || 'Unknown'}
    Location: ${primaryLocation || 'Unknown'}

    Respond with a number only. Do not include units or explanation.
    `.trim();

      const wageResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: wagePrompt }],
        temperature: 0.3
      });

      const raw = wageResponse.choices[0]?.message?.content?.trim();
      const parsed = parseFloat(raw || '');
      if (!isNaN(parsed) && parsed > 0 && parsed < 200) {
        averageWage = parsed;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.warn('Wage inference failed, using default:', errorMessage);
    }

    // 🧭 Generate dynamic prompt and messages
    const { messages } = buildApplyNowPrompt({
      chatHistory: chat_history || [],
      userInput: user_input,
      companyContext,
      hiringSummary,
      companyName,
      naicsCode,
      industry,
      primaryLocation,
      averageWage
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as ChatCompletionMessageParam[],
      temperature: 0.7
    });

    const assistantMessage = completion.choices[0]?.message?.content;
    const usage = completion.usage;

    return NextResponse.json({
      assistant_message: assistantMessage,
      token_usage: usage?.total_tokens || 0
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Chat agent error:', errorMessage);
    return NextResponse.json({ error: 'Chat agent failed to respond', details: errorMessage}, { status: 500 });
  }
}
