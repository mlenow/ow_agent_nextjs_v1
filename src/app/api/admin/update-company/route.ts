// src/app/api/admin/update-company/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/utils/db';

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      id,
      name,
      website_url,
      contact_email,
      industry,
      size_estimate,
      primary_location,
      naics_code,
      naics_description
    } = data;

    if (!id) {
      return NextResponse.json({ error: 'Missing company id' }, { status: 400 });
    }

    const pool = await getConnection();
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('website_url', sql.NVarChar, website_url)
      .input('contact_email', sql.NVarChar, contact_email) 
      .input('industry', sql.NVarChar, industry)
      .input('size_estimate', sql.NVarChar, size_estimate)
      .input('primary_location', sql.NVarChar, primary_location)
      .input('naics_code', sql.NVarChar, naics_code)
      .input('naics_description', sql.NVarChar, naics_description)
      .query(`
        UPDATE dbo.tbl_agent_companies
        SET
          name = @name,
          website_url = @website_url,
          contact_email = @contact_email,
          industry = @industry,
          size_estimate = @size_estimate,
          primary_location = @primary_location,
          naics_code = @naics_code,
          naics_description = @naics_description
        WHERE id = @id;
      `);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Update company error:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}