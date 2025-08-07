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
  status: 'Active' | 'Archived';
};

export default function ApplicationsList({ companyId }: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);

  const fetchApplications = async () => {
    const statusParam = showAll ? '' : '&status=Active';
    const res = await fetch(`/api/admin/tools/get-applications?company_id=${companyId}${statusParam}`);
    const data = await res.json();
    setApplications(data);
  };

  useEffect(() => {
    fetchApplications();
  }, [companyId, showAll]);

  const handleArchive = async (id: number) => {
    await fetch('/api/admin/tools/archive-application', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: id }),
    });
    fetchApplications(); // Refresh the list after archiving
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Submitted Applications</h2>
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showAll ? 'Show Active Only' : 'View All'}
        </button>
      </div>

      {applications.map((app) => (
        <div key={app.id} className="border rounded p-4 bg-white shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p
                className={`font-semibold ${
                  app.status === 'Archived' ? 'text-gray-400' : 'text-black'
                }`}
              >
                {app.status === 'Archived' ? 'Archived — ' : ''}
                {app.applicant_name || '(No Name)'}
              </p>
              <p className="text-sm text-gray-600">{app.applicant_email}</p>
              <p className="text-sm text-gray-500">
                {new Date(app.submitted_at).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <button
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                className="text-blue-600 hover:underline text-sm"
              >
                {expandedId === app.id ? 'Hide Transcript' : 'View Transcript'}
              </button>
              {app.status === 'Active' && (
                <button
                  onClick={() => handleArchive(app.id)}
                  className="text-red-500 hover:underline text-xs"
                >
                  Archive
                </button>
              )}
            </div>
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