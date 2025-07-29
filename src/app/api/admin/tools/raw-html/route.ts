// src/app/api/admin/tools/raw-html/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
  }

  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Optional: wait for a specific element like body, or let the JS finish
    await page.waitForSelector('body', { timeout: 5000 });

    const raw_html = await page.content();
    return NextResponse.json({ raw_html });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Failed to fetch raw HTML:', errorMessage);
    console.error('Playwright error:', err);
    return NextResponse.json({ error: 'Failed to fetch rendered HTML' }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}