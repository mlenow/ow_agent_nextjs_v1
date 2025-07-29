// src/app/api/admin/company-pages/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/utils/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('company_id');

    console.log('🔍 Fetching company pages for company_id:', companyId);

    const pool = await getConnection();

    const result = companyId
      ? await pool.request()
          .input('company_id', sql.Int, parseInt(companyId, 10))
          .query(`
            SELECT *
            FROM dbo.tbl_agent_company_pages
            WHERE company_id = @company_id AND status = 'Active'
            ORDER BY last_updated DESC
          `)
      : await pool.request()
          .query(`
            SELECT *
            FROM dbo.tbl_agent_company_pages
            WHERE status = 'Active'
            ORDER BY last_updated DESC
          `);

    return NextResponse.json(result.recordset, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Get company pages failed:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}