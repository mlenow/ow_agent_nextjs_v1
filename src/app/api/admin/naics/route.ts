// src/app/api/admin/naics/route.ts

import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/utils/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query('SELECT code, description FROM dbo.tbl_agent_naics_reference ORDER BY code ASC');

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching NAICS codes:', error);
    return NextResponse.json({ error: 'Failed to fetch NAICS codes' }, { status: 500 });
  }
}