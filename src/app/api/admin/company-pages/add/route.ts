// src/app/api/admin/company-pages/add/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/utils/db';

export async function POST(req: NextRequest) {
  try {
    const {
      company_id,
      page_type,
      source_url,
      raw_html = '',
      clean_text = '',
      structured_data = '{}'
    } = await req.json();

    if (!company_id || !page_type || !source_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = await getConnection();
    await pool.request()
      .input('company_id', sql.Int, company_id)
      .input('page_type', sql.VarChar, page_type)
      .input('source_url', sql.VarChar, source_url)
      .input('raw_html', sql.NVarChar(sql.MAX), raw_html)
      .input('clean_text', sql.NVarChar(sql.MAX), clean_text)
      .input('structured_json', sql.NVarChar(sql.MAX), structured_data)
      .input('status', sql.VarChar, 'Active')
      .input('last_updated', sql.DateTime, new Date())
      .query(`
        INSERT INTO dbo.tbl_agent_company_pages (
          company_id, page_type, source_url, raw_html, clean_text, structured_json, status, last_updated
        ) VALUES (
          @company_id, @page_type, @source_url, @raw_html, @clean_text, @structured_json, @status, @last_updated
        );
      `);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Add company page failed:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}