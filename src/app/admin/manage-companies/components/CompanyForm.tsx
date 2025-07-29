// src/app/admin/manage-companies/CompanyForm.tsx

'use client';

import { Company } from '@/lib/types/types';
import ChatTranscriptModal from '../../../../components/chat/ChatTranscriptModal';
import ChatButtonCustomizer from './ChatButtonCustomizer';
import { useState } from 'react';

type Props = {
  form: Company;
  naicsList: { code: string; description: string }[];
  naicsSearch: string;
  onChange: (updated: Company) => void;
  onNaicsSearch: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

export default function CompanyForm({
  form,
  naicsList,
  naicsSearch,
  onChange,
  onNaicsSearch,
  onSubmit,
  onCancel,
}: Props) {
  const [showChat, setShowChat] = useState(false);
  
  const filtered = naicsList.filter(n =>
    n.code.toLowerCase().includes(naicsSearch.toLowerCase()) ||
    n.description.toLowerCase().includes(naicsSearch.toLowerCase())
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4 mb-8">
      <input value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} className="w-full border p-2" placeholder="Company Name" required />
      <input value={form.website_url || ''} onChange={e => onChange({ ...form, website_url: e.target.value })} className="w-full border p-2" placeholder="Website URL www.XYZ.com" />
      <input
        type="email"
        value={form.contact_email || ''}
        onChange={e => onChange({ ...form, contact_email: e.target.value })}
        className="w-full border p-2"
        placeholder="Hiring Contact Email"
        required
      />
      <input type="text" value={naicsSearch} onChange={e => onNaicsSearch(e.target.value)} className="w-full border p-2" placeholder="Search NAICS codes" />
      <select
        value={form.naics_code || ''}
        onChange={e => {
          const selected = naicsList.find(n => n.code === e.target.value);
          onChange({
            ...form,
            naics_code: selected?.code || '',
            naics_description: selected?.description || '',
            industry: selected?.description || '',
          });
        }}
        className="w-full border p-2"
      >
        <option value="">Select NAICS Code</option>
        {filtered.map(code => (
          <option key={code.code} value={code.code}>
            {code.code} – {code.description}
          </option>
        ))}
      </select>
      <input value={form.size_estimate || ''} onChange={e => onChange({ ...form, size_estimate: e.target.value })} className="w-full border p-2" placeholder="Size (e.g. 11-50)" />
      <input value={form.primary_location || ''} onChange={e => onChange({ ...form, primary_location: e.target.value })} className="w-full border p-2" placeholder="Primary Location" />
      <div className="flex space-x-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {form.id ? 'Update Company' : 'Add Company'}
        </button>
        {form.id && (
          <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-4 py-2 rounded">
            Cancel
          </button>
        )}

        {/* Chat Transcript Modal Trigger */}
        <button
          type="button"
          onClick={() => setShowChat(true)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Test Chat
        </button>
        {form.id && showChat && (
          <ChatTranscriptModal
            companyId={form.id}
            companyName={form.name}
            contactEmail={form.contact_email || ''}
            onClose={() => setShowChat(false)}
          />
        )}

      </div>

        {/* Chat Button Customizer */}
        {form.id && (
          <div className="mt-6">
            <ChatButtonCustomizer
              companyId={form.public_id}
              existingValues={{
                chat_button_text: form.chat_button_text,
                chat_button_bg_color: form.chat_button_bg_color,
                chat_button_text_color: form.chat_button_text_color,
                chat_button_shape: form.chat_button_shape,
              }}
            />
          </div>
        )}
    </form>
  );
}
