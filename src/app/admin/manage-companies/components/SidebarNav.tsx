// src/app/admin/manage-companies/components/SidebarNav.tsx

'use client';

import { Company, CompanyPage } from '@/lib/types/types';

type Props = {
  selectedCompany: Company | null;
  companyPages: CompanyPage[];
  onSelectCompany: (company: Company | null) => void;
  onSelectPage: (page: CompanyPage) => void;
  onViewApplications: () => void;
};

export default function SidebarNav({
  selectedCompany,
  companyPages,
  onSelectCompany,
  onSelectPage,
  onViewApplications,
}: Props) {
  return (
    <aside className="w-64 bg-gray-100 p-4 border-r space-y-4 text-sm">
      <h2 className="text-lg font-bold">Navigation</h2>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onSelectCompany(null)} // Reset to show all companies
            className="text-left w-full text-blue-600 hover:underline"
          >
            🏢 Companies
          </button>
        </li>

        {selectedCompany && (
          <>
            {companyPages.length > 0 && (
              <ul className="ml-4 space-y-1">
                {companyPages.map((page) => (
                  <li key={page.id}>
                    <button
                      onClick={() => onSelectPage(page)}
                      className="text-left text-gray-600 hover:text-blue-600"
                    >
                      └ {page.page_type.replace('_', ' ')}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add Page Button */}
            <li>
              <button
                onClick={() =>
                  onSelectPage({
                    id: 0,
                    company_id: selectedCompany.id,
                    page_type: '',
                    source_url: '',
                    raw_html: '',
                    clean_text: '',
                    structured_json: '',
                    scraped_at: new Date().toISOString(),
                    status: 'Active',
                    created_at: new Date().toISOString(),
                    last_updated: new Date().toISOString(),
                  })
                }
                className="ml-4 text-left text-green-700 hover:underline mt-2"
              >
                ➕ Add Page
              </button>
            </li>

            {/* Applications */}
            <li>
            <button
              onClick={onViewApplications}
              className="ml-4 text-left text-blue-600 hover:underline mt-2"
            >
              📄 Applications
            </button>
            </li>
            
            

            
          </>
        )}

      </ul>
    </aside>
  );
}