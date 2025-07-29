// src/app/chat/page.tsx

import { notFound } from 'next/navigation';
import ChatTranscriptModal from '@/components/chat/ChatTranscriptModal';
import { getConnection, sql } from '@/lib/utils/db';

type Props = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ChatPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const publicId = resolvedSearchParams?.company_id;

  if (!publicId || typeof publicId !== 'string') return notFound();

  const pool = await getConnection();
  const result = await pool.request()
    .input('public_id', sql.UniqueIdentifier, publicId)
    .query(`
      SELECT id, name, contact_email
      FROM dbo.tbl_agent_companies
      WHERE public_id = @public_id AND status = 'Active'
    `);

  const company = result.recordset[0];
  if (!company) return notFound();

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg shadow-lg bg-white">
        <ChatTranscriptModal
          companyId={company.id}
          companyName={company.name}
          contactEmail={company.contact_email || ''}
        />
      </div>
    </div>
  );
}