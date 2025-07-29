//src/app/admin/manage-companies/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Company, CompanyPage } from '@/lib/types/types';
import SidebarNav from './components/SidebarNav';
import CompanyForm from './components/CompanyForm';
import CompanyPagesManager from './components/CompanyPagesManager';
import EditPageModal from './components/EditPageModal';
import ApplicationsList from './components/ApplicationsList';
import { redirect } from 'next/navigation';

export default function ManageCompaniesPage() {

  // 🚫 BLOCK access in production
  if (process.env.NODE_ENV === 'production') {
    redirect('https://www.ondework.com');
  }

  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyPages, setCompanyPages] = useState<CompanyPage[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedPage, setSelectedPage] = useState<CompanyPage | null>(null);
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [naicsList, setNaicsList] = useState<{ code: string; description: string }[]>([]);
  const [naicsSearch, setNaicsSearch] = useState('');
  const [viewingApplications, setViewingApplications] = useState(false);

  useEffect(() => {
    fetch('/api/admin/companies')
      .then((res) => res.json())
      .then(setCompanies);
  }, []);

  useEffect(() => {
    fetch('/api/admin/naics')
      .then(res => res.json())
      .then(setNaicsList)
      .catch(err => console.error('Failed to load NAICS list:', err));
  }, []);

  const handleSelectCompany = async (company: Company | null) => {
    setViewingApplications(false);
    setSelectedCompany(company);
    setSelectedPage(null);

    if (company?.id) {
      const res = await fetch(`/api/admin/company-pages?company_id=${company.id}`);
      if (res.ok) setCompanyPages(await res.json());
    } else {
      setCompanyPages([]);
    }
  };

  const handleSelectPage = (page: CompanyPage) => {
    setSelectedPage(page);
    setEditingPageId(page.id);
  };

  const refreshCompanies = async () => {
    const res = await fetch('/api/admin/companies');
    if (res.ok) setCompanies(await res.json());
  };

  const refreshPages = async (companyId: number) => {
    const res = await fetch(`/api/admin/company-pages?company_id=${companyId}`);
    if (res.ok) setCompanyPages(await res.json());
  };

  return (
    <div className="flex h-screen">
      <SidebarNav
        selectedCompany={selectedCompany}
        companyPages={companyPages}
        onSelectCompany={handleSelectCompany}
        onSelectPage={handleSelectPage}
        onViewApplications={() => {
          setViewingApplications(true);
          setSelectedPage(null);
        }}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {viewingApplications && selectedCompany ? (
          <ApplicationsList companyId={selectedCompany.id} />
        ) : !selectedCompany ? (
          <>
            <h1 className="text-2xl font-bold mb-4">Companies</h1>

            <button
              onClick={() =>
                setSelectedCompany({
                  id: 0,
                  name: '',
                  website_url: null,
                  industry: null,
                  naics_code: null,
                  naics_description: null,
                  size_estimate: null,
                  primary_location: null,
                  contact_email: null,
                  status: 'Active',
                })
              }
              className="mb-4 px-3 py-1 text-sm bg-blue-600 text-white rounded"
            >
              ➕ Add Company
            </button>

            <ul className="space-y-2">
              {companies.map((company) => (
                <li key={company.id}>
                  <button
                    onClick={() => handleSelectCompany(company)}
                    className="text-left text-blue-600 hover:underline"
                  >
                    {company.name}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Edit Company: {selectedCompany.name}</h1>

            <CompanyForm
              form={selectedCompany}
              onChange={setSelectedCompany}
              naicsList={naicsList}
              naicsSearch={naicsSearch}
              onNaicsSearch={setNaicsSearch}
              onSubmit={async (e) => {
                e.preventDefault();
                const endpoint = selectedCompany.id
                  ? '/api/admin/update-company'
                  : '/api/admin/add-company';
                const method = selectedCompany.id ? 'PUT' : 'POST';

                const res = await fetch(endpoint, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(selectedCompany),
                });

                if (res.ok) {
                  await refreshCompanies();
                  alert('Company saved.');
                } else {
                  alert('Something went wrong.');
                }
              }}
              onCancel={() => setSelectedCompany(null)}
            />

            <CompanyPagesManager
              companyId={selectedCompany.id}
              companyPages={companyPages}
              setCompanyPages={(pages) => {
                setCompanyPages(pages);
                setSelectedPage(null);
              }}
              onEditPage={(page) => {
                setEditingPageId(page.id);
                setSelectedPage(page);
              }}
            />
          </>
        )}

        {editingPageId && selectedPage && (
          <EditPageModal
            pageId={editingPageId}
            pageData={selectedPage}
            onClose={() => {
              setEditingPageId(null);
            }}
            onUpdated={() => {
              if (selectedCompany) refreshPages(selectedCompany.id);
            }}
          />
        )}
      </main>
    </div>
  );
}