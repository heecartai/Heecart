import React, { Suspense, lazy } from 'react';
import { CRM_PATH, useRoute } from './lib/router';
import Storefront from './Storefront';

// The CRM is its own chunk, so shoppers never download it.
const CrmApp = lazy(() => import('./crm/CrmApp'));

export default function App() {
  const route = useRoute();

  if (route.path === CRM_PATH) {
    return (
      <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-ink/60">Loading…</div>}>
        <CrmApp />
      </Suspense>
    );
  }

  return <Storefront route={route} />;
}
