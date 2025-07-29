// src/app/api/widget-config/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/utils/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publicId = searchParams.get('company_id');
  const origin = req.headers.get('origin');

  if (!publicId) {
    return new NextResponse(JSON.stringify({ error: 'Missing company_id' }), {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Vary': 'Origin',
      },
    });
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('public_id', sql.UniqueIdentifier, publicId)
      .query(`
        SELECT
          website_url,
          chat_button_text,
          chat_button_bg_color,
          chat_button_text_color,
          chat_button_shape
        FROM dbo.tbl_agent_companies
        WHERE public_id = @public_id AND status = 'Active'
      `);

    const company = result.recordset[0];

    if (!company) {
      return new NextResponse(JSON.stringify({ error: 'Company not found or inactive' }), {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Vary': 'Origin',
        },
      });
    }

    const normalize = (host: string) => host.replace(/^www\./, '').toLowerCase();

    const originHostname = origin ? normalize(new URL(origin).hostname) : '';
    const allowedHostname = company.website_url ? normalize(new URL(company.website_url).hostname) : '';
    const isOriginAllowed = originHostname === allowedHostname;

    if (!isOriginAllowed) {
      console.warn(`⚠️ Origin not allowed: ${originHostname} (expected: ${allowedHostname})`);
      return new NextResponse(JSON.stringify({ error: 'Origin not authorized' }), {
        status: 403,
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Vary': 'Origin',
        },
      });
    }

    return new NextResponse(JSON.stringify({
      buttonText: company.chat_button_text || 'Chat with us',
      bgColor: company.chat_button_bg_color || '#000000',
      textColor: company.chat_button_text_color || '#ffffff',
      shape: company.chat_button_shape || 'rounded',
    }), {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
      },
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Widget config fetch failed:', errorMessage);
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      details: errorMessage
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Vary': 'Origin',
      },
    });
  }
}