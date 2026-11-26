import React, { Suspense, lazy } from 'react';
import { CRM_PATH, useRoute } from './lib/router';
import Storefront from './Storefront';
import Loader from './components/Loader';

// The CRM is its own chunk, so shoppers never download it.
const CrmApp = lazy(() => import('./crm/CrmApp'));

export default function App() {
  const route = useRoute();

  if (route.path === CRM_PATH) {
    return (
      <Suspense fallback={<Loader label="Loading store manager" />}>
        <CrmApp />
      </Suspense>
    );
  }

  return <Storefront route={route} />;
}
