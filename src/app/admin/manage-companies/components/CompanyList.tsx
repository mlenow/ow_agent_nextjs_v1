// src/app/admin/manage-companies/components/CompanyList.tsx

'use client';

import { Company } from '@/lib/types/types';

type Props = {
  companies: Company[];
  onEdit: (c: Company) => void;
  onToggleArchive: (c: Company) => void;
};

export default function CompanyList({ companies, onEdit, onToggleArchive }: Props) {
  return (
    <div className="space-y-4">
      {companies.map((c) => (
        <div key={c.id} className="border p-4 rounded flex justify-between items-center">
          <div>
            <p className="font-semibold">{c.name}</p>
            <p className="text-sm text-gray-500">{c.website_url}</p>
            <p className="text-sm text-gray-500">{c.industry} • {c.size_estimate} • {c.primary_location}</p>
            <p className="text-sm text-gray-500">NAICS: {c.naics_code} – {c.naics_description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => onEdit(c)} className="text-blue-600">Edit</button>
            <label className="flex items-center space-x-1 text-sm">
              <input type="checkbox" checked={c.status === 'Archived'} onChange={() => onToggleArchive(c)} />
              <span>Archived</span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}