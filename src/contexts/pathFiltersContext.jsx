import useStoragedSet from '../utils/StoragedSet';
import { createContext, useContext } from 'react';

const PathFiltersContext = createContext({
  values: new Set(),
  add: () => {},
  remove: () => {},
  clear: () => {},
  has: () => {},
  size: () => {},
  forEach: () => {},
});

const Provider = PathFiltersContext.Provider;
const usePathFiltersContext = () => {
  const context = useContext(PathFiltersContext);
  if (!context) {
    throw new Error('usePathFiltersContext must be used within a PathFiltersProvider');
  }
  return context;
};

function PathFiltersProvider({ children }) {
  const storagedSet = useStoragedSet('path-filters');

  const providerValue = { ...storagedSet };

  return <Provider value={providerValue}>{children}</Provider>;
}

export { PathFiltersContext, PathFiltersProvider, usePathFiltersContext };