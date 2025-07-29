// src/app/api/public/company-id/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/utils/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publicId = searchParams.get('public_id');

  if (!publicId) {
    return NextResponse.json({ error: 'Missing public_id' }, { status: 400 });
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('public_id', sql.UniqueIdentifier, publicId)
      .query(`
        SELECT id
        FROM dbo.tbl_agent_companies
        WHERE public_id = @public_id AND status = 'Active'
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ company_id: result.recordset[0].id });
  } catch (err) {
    console.error('Company ID resolution failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}