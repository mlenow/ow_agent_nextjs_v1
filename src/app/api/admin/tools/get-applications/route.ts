// src/app/api/admin/tools/get-applications/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/utils/db';

export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get('company_id');

  if (!companyId) {
    return NextResponse.json({ error: 'Missing company_id' }, { status: 400 });
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('company_id', parseInt(companyId, 10)) // <-- Fix is here
      .query(`
        SELECT *
        FROM tbl_agent_applications
        WHERE company_id = @company_id
        ORDER BY submitted_at DESC
      `);

    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error('Error fetching applications:', err);
    return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 });
  }
}