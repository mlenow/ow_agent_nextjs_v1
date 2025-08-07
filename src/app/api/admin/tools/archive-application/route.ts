// src/app/api/admin/tools/archive-application/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/utils/db';

export async function PUT(req: NextRequest) {
  try {
    const { application_id } = await req.json();

    if (!application_id) {
      return NextResponse.json({ error: 'Missing application_id' }, { status: 400 });
    }

    const pool = await getConnection();

    await pool.request()
      .input('application_id', sql.Int, application_id)
      .query(`
        UPDATE tbl_agent_applications
        SET status = 'Archived'
        WHERE id = @application_id
      `);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error archiving application:', err);
    return NextResponse.json({ error: 'Failed to archive application' }, { status: 500 });
  }
}