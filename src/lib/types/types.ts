// src/lib/types/types.ts

export type Company = {
  id: number;
  name: string;
  website_url?: string | null;
  contact_email?: string | null;
  industry?: string | null;
  size_estimate?: string | null;
  primary_location?: string | null;
  created_at?: string; // ISO string, optional
  naics_code?: string | null;
  naics_description?: string | null;
  chat_button_text?: string;
  chat_button_bg_color?: string;
  chat_button_text_color?: string;
  chat_button_shape?: 'square' | 'rounded' | 'pill';
  public_id?: string;
  status: 'Active' | 'Archived';
};

export type CompanyPage = {
  id: number;
  company_id: number;
  page_type: string; // e.g. 'career', 'about', etc.
  source_url?: string | null;
  raw_html?: string | null;
  clean_text?: string | null;
  structured_json?: string | null;
  scraped_at?: string | null; // datetime
  status: 'Active' | 'Archived';
  last_updated?: string | null;
  created_at: string;
};