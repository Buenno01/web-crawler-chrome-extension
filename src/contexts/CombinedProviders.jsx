import React from 'react';
import { CssSelectorsProvider } from './cssSelectorsContext';
import { PathFiltersProvider } from './pathFiltersContext';
import { DataExtractionProvider } from './dataExtractionContext';

function CombinedProviders({ children }) {
  return (
    <PathFiltersProvider>
      <CssSelectorsProvider>
        <DataExtractionProvider>
          {children}
        </DataExtractionProvider>
      </CssSelectorsProvider>
    </PathFiltersProvider>
  );
}

export default CombinedProviders;