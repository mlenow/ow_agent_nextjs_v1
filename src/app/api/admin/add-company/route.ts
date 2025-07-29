// src/app/api/admin/add-company/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/utils/db';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      name,
      website_url,
      industry,
      size_estimate,
      primary_location,
      naics_code,
      naics_description,
      contact_email,
      status = 'Active'  // Default if not provided
    } = data;

    if (!name) {
      return NextResponse.json({ error: 'Missing company name' }, { status: 400 });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('name', sql.NVarChar(255), name)
      .input('website_url', sql.NVarChar(2048), website_url || null)
      .input('industry', sql.NVarChar(255), industry || null)
      .input('size_estimate', sql.NVarChar(100), size_estimate || null)
      .input('primary_location', sql.NVarChar(255), primary_location || null)
      .input('naics_code', sql.VarChar(10), naics_code || null)
      .input('naics_description', sql.NVarChar(255), naics_description || null)
      .input('contact_email', sql.NVarChar(255), contact_email || null)
      .input('status', sql.NVarChar(50), status)
      .query(`
        INSERT INTO dbo.tbl_agent_companies 
        (name, website_url, industry, size_estimate, primary_location, naics_code, naics_description, contact_email, status)
        OUTPUT INSERTED.*
        VALUES (@name, @website_url, @industry, @size_estimate, @primary_location, @naics_code, @naics_description, @contact_email, @status)
      `);

    return NextResponse.json(result.recordset[0], { status: 201 });
    } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Add company failed:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}