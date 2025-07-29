// src/app/admin/manage-companies/layout.tsx

'use client';

import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      window.location.href = '/';
    }
  }, []);

  return <>{children}</>;
}