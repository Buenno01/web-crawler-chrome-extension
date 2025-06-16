import React from 'react';
import { CssSelectorsProvider } from './cssSelectorsContext';
import { PathFiltersProvider } from './pathFiltersContext';

function CombinedProviders({ children }) {
  return (
    <>
      <PathFiltersProvider>
        <CssSelectorsProvider>
          {children}
        </CssSelectorsProvider>
      </PathFiltersProvider>
    </>
  )
}

export default CombinedProviders;