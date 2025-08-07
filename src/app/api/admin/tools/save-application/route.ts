// src/app/api/admin/tools/save-application/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/utils/db';
import { sendApplicationEmail } from '@/lib/utils/emailService';

/**
 * POST /api/admin/tools/save-application
 * Accepts: company_id, applicant_name, applicant_email, applicant_phone, chat_transcript (array of messages)
 */
export async function POST(req: NextRequest) {
  try {
    const {
      company_id,
      applicant_name,
      applicant_email,
      applicant_phone,
      chat_transcript,
    } = await req.json();

    if (!company_id || !Array.isArray(chat_transcript)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transcriptString = chat_transcript
      .map((entry: { sender: string; message: string }) => `${entry.sender.toUpperCase()}: ${entry.message}`)
      .join('\n');

    const pool = await getConnection();

    const companyInfo = await pool.request()
    .input('company_id', company_id)
    .query(`
        SELECT name, contact_email
        FROM tbl_agent_companies
        WHERE id = @company_id
    `);

    const company_name = companyInfo.recordset[0]?.name || 'Unnamed Company';
    const contact_email = companyInfo.recordset[0]?.contact_email || '';
    
    await pool.request()
      .input('company_id', company_id)
      .input('applicant_name', applicant_name || '')
      .input('applicant_email', applicant_email || '')
      .input('applicant_phone', applicant_phone || '')
      .input('chat_transcript', transcriptString)
      .query(`
        INSERT INTO tbl_agent_applications (
          company_id,
          applicant_name,
          applicant_email,
          applicant_phone,
          chat_transcript,
          submitted_at,
          status
        ) VALUES (
          @company_id,
          @applicant_name,
          @applicant_email,
          @applicant_phone,
          @chat_transcript,
          GETDATE(),
          'Active'
        )
      `)
    // Send the application email
    await sendApplicationEmail(
    company_name,
    contact_email || 'hello@ondework.com',
    transcriptString,
    applicant_name,
    applicant_email,
    applicant_phone
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Save application error:', errorMessage);
    return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });
  }
}