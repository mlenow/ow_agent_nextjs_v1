// src/app/api/admin/tools/get-applications/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/utils/db';

export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get('company_id');
  const status = req.nextUrl.searchParams.get('status');

  if (!companyId) {
    return NextResponse.json({ error: 'Missing company_id' }, { status: 400 });
  }

  try {
    const pool = await getConnection();

    let query = `
      SELECT *
      FROM tbl_agent_applications
      WHERE company_id = @company_id
    `;

    if (status) {
      query += ` AND status = @status`;
    }

    query += ` ORDER BY submitted_at DESC`;

    const request = pool.request().input('company_id', sql.Int, parseInt(companyId, 10));
    if (status) request.input('status', sql.NVarChar(20), status);

    const result = await request.query(query);

    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error('Error fetching applications:', err);
    return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 });
  }
}