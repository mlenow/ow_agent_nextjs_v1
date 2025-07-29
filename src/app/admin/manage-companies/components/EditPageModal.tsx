// src/app/admin/manage-companies/components/EditPageModal.tsx

'use client';

import { useEffect, useState } from 'react';
import { CompanyPage } from '@/lib/types/types';

type Props = {
  pageId: number;
  pageData: CompanyPage;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditPageModal({ pageId, pageData, onClose, onUpdated }: Props) {
  const [sourceUrl, setSourceUrl] = useState(pageData.source_url ?? '');
  const [pageType, setPageType] = useState<'about_us' | 'career_page' | 'job_postings'>(pageData.page_type as 'about_us' | 'career_page' | 'job_postings');
  const [status, setStatus] = useState<'Active' | 'Archived'>(pageData.status as 'Active' | 'Archived');
  const [structuredJson, setStructuredJson] = useState(pageData.structured_json ?? '');
  const [rawHtml, setRawHtml] = useState(pageData.raw_html ?? '');
  const [cleanText, setCleanText] = useState(pageData.clean_text ?? '');
  const [loadingRawHtml, setLoadingRawHtml] = useState(false);
  const [loadingCleanText, setLoadingCleanText] = useState(false);

  useEffect(() => {
    setSourceUrl(pageData.source_url ?? '');
    setPageType(pageData.page_type as 'about_us' | 'career_page' | 'job_postings');
    setStatus(pageData.status as 'Active' | 'Archived');
    setStructuredJson(pageData.structured_json ?? '');
    setRawHtml(pageData.raw_html ?? '');
    setCleanText(pageData.clean_text ?? '');
  }, [pageData]);

  const handleSave = async () => {
    const res = await fetch('/api/admin/company-pages/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: pageId,
        source_url: sourceUrl,
        page_type: pageType,
        status,
        structured_json: structuredJson,
        raw_html: rawHtml,
        clean_text: cleanText,
      }),
    });

    if (res.ok) {
      onUpdated();
      onClose();
    } else {
      alert('Update failed');
    }
  };

  const handleFetchRawHtml = async () => {
    if (!sourceUrl) {
      alert('Please enter a URL first.');
      return;
    }

    setLoadingRawHtml(true);
    try {
      const res = await fetch('/api/admin/tools/raw-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl }),
      });

      const data = await res.json();
      if (res.ok) {
        setRawHtml(data.raw_html);
      } else {
        alert(data.error || 'Failed to fetch HTML.');
      }
    } catch (error) {
      alert('Error fetching raw HTML.');
      console.error(error);
    } finally {
      setLoadingRawHtml(false);
    }
  };

  const handleCleanHtml = async () => {
    if (!rawHtml) {
      alert('Raw HTML is empty.');
      return;
    }



    setLoadingCleanText(true);
    try {
      const res = await fetch('/api/admin/tools/clean-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_html: rawHtml }),
      });

      const data = await res.json();
      if (res.ok) {
        setCleanText(data.clean_text);
      } else {
        alert(data.error || 'Failed to clean HTML.');
      }
    } catch (error) {
      alert('Error cleaning HTML.');
      console.error(error);
    } finally {
      setLoadingCleanText(false);
    }
  };

  const handleStructureHtml = async () => {
    if (!cleanText) {
      alert('Clean Text is empty.');
      return;
    }

    try {
      const res = await fetch('/api/admin/tools/structured-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clean_text: cleanText }),
      });

      const data = await res.json();
      if (res.ok) {
        setStructuredJson(JSON.stringify(data, null, 2));
      } else {
        alert(data.error || 'Failed to structure HTML.');
      }
    } catch (error) {
      alert('Error structuring HTML.');
      console.error(error);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-lg font-semibold">Edit Page</h3>

      <label className="block text-sm font-medium">Page Type</label>
      <select
        className="border p-2 w-full"
        value={pageType}
        onChange={(e) => setPageType(e.target.value as 'about_us' | 'career_page' | 'job_postings')}
      >
        <option value="about_us">About Us</option>
        <option value="career_page">Career Page</option>
        <option value="job_postings">Job Postings</option>
      </select>

      <label className="block text-sm font-medium">Page URL</label>
      <input
        type="url"
        className="border p-2 w-full"
        value={sourceUrl}
        onChange={(e) => setSourceUrl(e.target.value)}
      />

      <label className="block text-sm font-medium">Status</label>
      <select
        className="border p-2 w-full"
        value={status}
        onChange={(e) => setStatus(e.target.value as 'Active' | 'Archived')}
      >
        <option value="Active">Active</option>
        <option value="Archived">Archived</option>
      </select>

      <label className="block text-sm font-medium">Structured JSON (for pages with job postings only)</label>
      <textarea
        className="border p-2 w-full font-mono text-sm"
        rows={4}
        value={structuredJson}
        onChange={(e) => setStructuredJson(e.target.value)}
      />

      <div className="flex gap-2">

        {/* Fetch raw HTML button */}
        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50"
          onClick={handleFetchRawHtml}
          disabled={loadingRawHtml}
        >
          {loadingRawHtml ? 'Fetching HTML...' : 'Fetch Raw HTML from URL'}
        </button>

        {/* Clean HTML button only enabled if raw HTML is present */}
        <button
          className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
          onClick={handleCleanHtml}
          disabled={loadingCleanText}
        >
          {loadingCleanText ? 'Cleaning HTML...' : 'Clean from Raw HTML'}
        </button>

        {/* Generate structured JSON from clean text */}
        <button
          className="bg-orange-600 text-white px-3 py-1 rounded disabled:opacity-50"
          onClick={handleStructureHtml}
        >
          Generate Structured JSON
        </button>

      </div>

      <label className="block text-sm font-medium">Raw HTML</label>
      <textarea
        className="border p-2 w-full font-mono text-xs"
        rows={6}
        value={rawHtml}
        onChange={(e) => setRawHtml(e.target.value)}
      />

      <label className="block text-sm font-medium">Clean Text</label>
      <textarea
        className="border p-2 w-full font-mono text-sm"
        rows={6}
        value={cleanText}
        onChange={(e) => setCleanText(e.target.value)}
      />

      <div className="flex space-x-2 pt-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>Save</button>
        <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}