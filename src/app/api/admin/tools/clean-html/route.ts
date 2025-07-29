import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

function polishText(text: string): string {
  return text
    // Insert period + space between lowercase word and capitalized word (e.g., "goals.Our" → "goals. Our")
    .replace(/([a-z])([A-Z])/g, '$1. $2')

    // Separate stuck capitalized words (e.g., "SafetyFirst" → "Safety First")
    .replace(/([a-z])([A-Z][a-z])/g, '$1 $2')

    // Remove repeated punctuation
    .replace(/([.!?]){2,}/g, '$1')

    // Final normalize
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { raw_html } = await req.json();
    if (!raw_html) {
      return NextResponse.json({ error: 'Missing raw_html' }, { status: 400 });
    }

    const $ = cheerio.load(raw_html);

    // Remove layout noise
    $('header, footer, nav, aside, noscript, iframe, script, style').remove();
    $('[style*="display:none"], [aria-hidden="true"]').remove();

    // Add space between inline elements that get jammed
    $('a, span, strong, em, b, i').each(function () {
      const $el = $(this);
      const next = $el[0].nextSibling;
      if (next && next.type === 'text' && !/^\s/.test(next.data)) {
        next.data = ' ' + next.data;
      }
    });

    // Extract, normalize, and polish
    const rawText = $('body').text();
    const normalized = rawText.replace(/\s+/g, ' ').trim();
    const clean_text = polishText(normalized);

    return NextResponse.json({ clean_text });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Clean HTML failed:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}