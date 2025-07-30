// src/app/chat/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';
import ChatTranscriptModal from '@/components/chat/ChatTranscriptModal';
import { getConnection, sql } from '@/lib/utils/db';

type Props = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ChatPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const publicId = resolvedSearchParams?.company_id;
  const referrer = resolvedSearchParams?.referrer;

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
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (window !== window.parent) {
              document.documentElement.setAttribute('data-is-modal', '1');
            }
          `,
        }}
      />
      
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg shadow-lg bg-white relative">

          {/* ✅ Return button shown only when NOT in modal */}
          {referrer && typeof referrer === 'string' && (
            <Link
              href={decodeURIComponent(referrer)}
              className="return-to-site-button absolute top-4 left-4 bg-gray-100 text-sm text-blue-700 px-3 py-1.5 rounded-md shadow hover:bg-gray-200 transition"
              target="_top"
            >
              ← Return to Site
            </Link>
          )}

          <ChatTranscriptModal
            companyId={company.id}
            companyName={company.name}
            contactEmail={company.contact_email || ''}
          />
        </div>
      </div>
    </>
  );
}