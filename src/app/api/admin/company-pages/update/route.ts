// src/app/api/admin/company-pages/update/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/utils/db';

export async function POST(req: NextRequest) {
  try {
    const {
      id,
      source_url,
      raw_html = '',
      clean_text = '',
      structured_json = '{}',
    } = await req.json();

    if (!id || !source_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = await getConnection();
    await pool.request()
      .input('id', sql.Int, id)
      .input('source_url', sql.NVarChar(2048), source_url)
      .input('raw_html', sql.NVarChar(sql.MAX), raw_html)
      .input('clean_text', sql.NVarChar(sql.MAX), clean_text)
      .input('structured_json', sql.NVarChar(sql.MAX), structured_json)
      .input('last_updated', sql.DateTime, new Date())
      .query(`
        UPDATE dbo.tbl_agent_company_pages
        SET 
          source_url = @source_url,
          raw_html = @raw_html,
          clean_text = @clean_text,
          structured_json = @structured_json,
          last_updated = @last_updated
        WHERE id = @id;
      `);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Update company page failed:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}