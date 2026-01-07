import useStoragedSet from '../utils/StoragedSet';
import { createContext, useContext } from 'react';

const CssSelectorsContext = createContext({
  values: new Set(),
  add: () => {},
  remove: () => {},
  clear: () => {},
  has: () => {},
  size: () => {},
  forEach: () => {},
});

const Provider = CssSelectorsContext.Provider;
const useCssSelectorsContext = () => {
  const context = useContext(CssSelectorsContext);
  if (!context) {
    throw new Error('useCssSelectorsContext must be used within a CssSelectorsProvider');
  }
  return context;
};

function CssSelectorsProvider({ children }) {
  const storagedSet = useStoragedSet('css-selectors');

  const providerValue = { ...storagedSet };

  return <Provider value={providerValue}>{children}</Provider>;
}

export { CssSelectorsContext, CssSelectorsProvider, useCssSelectorsContext };