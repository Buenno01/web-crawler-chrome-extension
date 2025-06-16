import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePathFiltersContext } from './pathFiltersContext';
import { useCssSelectorsContext } from './cssSelectorsContext';
import DataExtractionService from '../services/dataExtractionService';

const DataExtractionContext = createContext({
  isExtracting: false,
  extractedData: null,
  progress: { processed: 0, pending: 0, total: 0, currentUrl: '' },
  error: null,
  startExtraction: () => {},
  cancelExtraction: () => {},
  clearData: () => {},
});

export const useDataExtractionContext = () => {
  const context = useContext(DataExtractionContext);
  if (!context) {
    throw new Error('useDataExtractionContext must be used within a DataExtractionProvider');
  }
  return context;
};

export function DataExtractionProvider({ children }) {
  const pathFilters = usePathFiltersContext();
  const cssSelectors = useCssSelectorsContext();
  
  const [state, setState] = useState({
    isExtracting: false,
    extractedData: null,
    progress: { processed: 0, pending: 0, total: 0, currentUrl: '' },
    error: null,
  });

  const extractionService = useCallback(() => {
    return new DataExtractionService(pathFilters.values, cssSelectors.values);
  }, [pathFilters.values, cssSelectors.values]);

  const startExtraction = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isExtracting: true, error: null }));
      
      const service = extractionService();
      
      const onProgress = (progress) => {
        setState(prev => ({ ...prev, progress }));
      };

      const data = await service.startExtraction(onProgress);
      
      setState(prev => ({
        ...prev,
        isExtracting: false,
        extractedData: data,
        progress: { processed: 0, pending: 0, total: 0, currentUrl: '' }
      }));

      // Save to storage
      await chrome.storage.local.set({ extractedData: data });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExtracting: false,
        error: error.message,
        progress: { processed: 0, pending: 0, total: 0, currentUrl: '' }
      }));
    }
  }, [extractionService]);

  const cancelExtraction = useCallback(() => {
    const service = extractionService();
    service.shouldCancel = true;
    setState(prev => ({ ...prev, isExtracting: false }));
  }, [extractionService]);

  const clearData = useCallback(async () => {
    await chrome.storage.local.remove(['extractedData']);
    setState(prev => ({ ...prev, extractedData: null }));
  }, []);

  // Load saved data on mount
  useEffect(() => {
    chrome.storage.local.get(['extractedData'], (result) => {
      if (result.extractedData) {
        setState(prev => ({ ...prev, extractedData: result.extractedData }));
      }
    });
  }, []);

  const value = {
    ...state,
    startExtraction,
    cancelExtraction,
    clearData,
  };

  return (
    <DataExtractionContext.Provider value={value}>
      {children}
    </DataExtractionContext.Provider>
  );
} 