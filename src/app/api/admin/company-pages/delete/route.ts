// src/app/api/admin/company-pages/delete/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/utils/db';

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing page id' }, { status: 400 });

    const pool = await getConnection();
    await pool.request()
      .input('id', sql.Int, id)
      .input('last_updated', sql.DateTime, new Date())
      .query(`
        UPDATE dbo.tbl_agent_company_pages
        SET status = 'Archived', last_updated = @last_updated
        WHERE id = @id
      `);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Delete company page failed:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}