// src/app/api/admin/update-chat-button/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/utils/db';

export async function PUT(req: NextRequest) {
  try {
    const {
      company_id,
      chat_button_text,
      chat_button_bg_color,
      chat_button_text_color,
      chat_button_shape
    } = await req.json();

    if (!company_id) {
      return NextResponse.json({ error: 'Missing company_id' }, { status: 400 });
    }

    const pool = await getConnection();
    await pool.request()
      .input('company_id', sql.UniqueIdentifier, company_id)
      .input('chat_button_text', sql.NVarChar(100), chat_button_text || null)
      .input('chat_button_bg_color', sql.VarChar(7), chat_button_bg_color || null)
      .input('chat_button_text_color', sql.VarChar(7), chat_button_text_color || null)
      .input('chat_button_shape', sql.VarChar(20), chat_button_shape || null)
      .query(`
        UPDATE dbo.tbl_agent_companies
        SET
          chat_button_text = @chat_button_text,
          chat_button_bg_color = @chat_button_bg_color,
          chat_button_text_color = @chat_button_text_color,
          chat_button_shape = @chat_button_shape
        WHERE public_id = @company_id;
      `);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: unknown) {
    console.error('❌ Failed to update chat button config:', err);

    if (err instanceof Error) {
      return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}