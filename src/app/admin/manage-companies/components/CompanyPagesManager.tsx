// src/app/admin/manage-companies/components/CompanyPagesManager.tsx

'use client';

import { useState } from 'react';
import { CompanyPage } from '@/lib/types/types';

type Props = {
  companyId: number;
  companyPages: CompanyPage[];
  setCompanyPages: (pages: CompanyPage[]) => void;
  onEditPage: (page: CompanyPage) => void;
};

export default function CompanyPagesManager({ companyId, companyPages, setCompanyPages, onEditPage }: Props) {
  const [newPageUrl, setNewPageUrl] = useState('');
  const [newPageType, setNewPageType] = useState<'about_us' | 'career_page' | 'job_postings'>('about_us');

  const handleAddPage = async () => {
    if (!newPageUrl.trim().startsWith('http')) return alert('Page URL must start with http or https');

    const alreadyExists = companyPages.some(
      p => p.page_type === newPageType && p.status === 'Active'
    );
    if (alreadyExists) {
      alert(`A '${newPageType.replace('_', ' ')}' page already exists.`);
      return;
    }

    const res = await fetch('/api/admin/company-pages/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: companyId,
        page_type: newPageType,
        source_url: newPageUrl,
        raw_html: '',
        clean_text: '',
        structured_data: '{}',
      }),
    });

    if (!res.ok) return alert('Failed to add page.');

    setNewPageUrl('');
    setNewPageType('about_us');

    const updated = await fetch(`/api/admin/company-pages?company_id=${companyId}`);
    if (updated.ok) setCompanyPages(await updated.json());
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm('Are you sure you want to delete this page?');
    if (!confirmed) return;

    const res = await fetch('/api/admin/company-pages/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      const updated = await fetch(`/api/admin/company-pages?company_id=${companyId}`);
      if (updated.ok) setCompanyPages(await updated.json());
    } else {
      alert('Delete failed');
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Company Pages</h2>

      <div className="bg-white border p-4 rounded mb-4">
        <h3 className="font-semibold mb-2">Add New Page</h3>
        <div className="flex flex-col space-y-2">
          <select className="border p-2" value={newPageType} onChange={(e) => setNewPageType(e.target.value as 'about_us' | 'career_page' | 'job_postings')}>
            <option value="about_us">About Us</option>
            <option value="career_page">Career Page</option>
            <option value="job_postings">Job Postings</option>
          </select>
          <input
            type="url"
            placeholder="Page URL"
            value={newPageUrl}
            onChange={e => setNewPageUrl(e.target.value)}
            className="border p-2"
          />
          <button onClick={handleAddPage} className="bg-green-600 text-white px-4 py-2 rounded">
            Add Page
          </button>
        </div>
      </div>

      {companyPages.length > 0 ? (
        <ul className="space-y-3">
          {companyPages.map((page) => (
            <li key={page.id} className="border p-4 rounded bg-gray-50">
              <p><strong>Type:</strong> {page.page_type}</p>
              <p><strong>Status:</strong> {page.status}</p>
              <p><strong>URL:</strong> <a href={page.source_url ?? '#'} className="text-blue-600 underline" target="_blank">{page.source_url}</a></p>
              <p className="text-sm text-gray-500">
                Last Updated:{' '}
                {page.last_updated ? new Date(page.last_updated).toLocaleString() : 'N/A'}
              </p>
              <div className="flex space-x-2 mt-2">
                <button className="text-blue-600 text-sm" onClick={() => onEditPage(page)}>Edit</button>
                <button className="text-red-600 text-sm" onClick={() => handleDelete(page.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No pages added yet for this company.</p>
      )}
    </div>
  );
}