import React from 'react';
import { CssSelectorsProvider } from './cssSelectorsContext';

function CombinedProviders({ children }) {
  return (
    <>
      <CssSelectorsProvider>
            {children}
      </CssSelectorsProvider>
    </>
  )
}

export default CombinedProviders;