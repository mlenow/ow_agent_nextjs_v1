// src/app/api/admin/archive-company/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/utils/db';

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id } = data;

  if (!id) {
    return NextResponse.json({ error: 'Missing company id' }, { status: 400 });
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', id)
      .query(`
        UPDATE dbo.tbl_agent_companies
        SET status = 'Archived'
        OUTPUT inserted.*
        WHERE id = @id;
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0], { status: 200 });
    } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Archive company failed:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}