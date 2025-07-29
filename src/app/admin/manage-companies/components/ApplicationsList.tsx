// src/app/admin/manage-companies/components/ApplicationsList.tsx

'use client';

import { useEffect, useState } from 'react';

type Props = {
  companyId: number;
};

type Application = {
  id: number;
  company_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  chat_transcript: string;
  submitted_at: string;
};

export default function ApplicationsList({ companyId }: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const res = await fetch(`/api/admin/tools/get-applications?company_id=${companyId}`);
      const data = await res.json();
      setApplications(data);
    };
    fetchApplications();
  }, [companyId]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Submitted Applications</h2>
      {applications.map((app) => (
        <div key={app.id} className="border rounded p-4 bg-white shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{app.applicant_name || '(No Name)'}</p>
              <p className="text-sm text-gray-600">{app.applicant_email}</p>
              <p className="text-sm text-gray-500">{new Date(app.submitted_at).toLocaleString()}</p>
            </div>
            <button
              onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
              className="text-blue-600 hover:underline text-sm"
            >
              {expandedId === app.id ? 'Hide Transcript' : 'View Transcript'}
            </button>
          </div>
          {expandedId === app.id && (
            <pre className="mt-4 p-2 bg-gray-50 border rounded text-xs whitespace-pre-wrap">
              {app.chat_transcript}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}