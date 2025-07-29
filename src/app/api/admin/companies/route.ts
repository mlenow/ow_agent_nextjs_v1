// src/app/api/admin/companies/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/utils/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get('id');

  try {
    const pool = await getConnection();

    // If ?id is provided, fetch a single company
    if (idParam !== null) {
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid company id' }, { status: 400 });
      }

      const singleResult = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT * FROM dbo.tbl_agent_companies WHERE id = @id`);

      if (singleResult.recordset.length === 0) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      return NextResponse.json(singleResult.recordset[0], { status: 200 });
    }

    // Otherwise return all companies
    const result = await pool.request().query(`
      SELECT * FROM dbo.tbl_agent_companies ORDER BY name;
    `);

    return NextResponse.json(result.recordset, { status: 200 });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Get company failed:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}