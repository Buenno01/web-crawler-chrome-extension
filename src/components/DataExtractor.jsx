import React from 'react';
import { useDataExtractionContext } from '../contexts/dataExtractionContext';
import { useCssSelectorsContext } from '../contexts/cssSelectorsContext';
import { usePathFiltersContext } from '../contexts/pathFiltersContext';
import ExtractionControls from './ExtractionControls';
import ProgressIndicator from './ProgressIndicator';
import MessageBox from './ui/MessageBox';
import { useTranslation } from '../hooks/useTranslation';

export default function DataExtractor() {
  const { t } = useTranslation();
  const { values: cssSelectors } = useCssSelectorsContext();
  const { values: pathFilters } = usePathFiltersContext();

  const {
    isExtracting,
    extractedData,
    progress,
    error,
    startExtraction,
    cancelExtraction,
    clearData
  } = useDataExtractionContext();

  const information = [
    {
      label: t('cssSelectors'),
      value: cssSelectors.length,
    },
    {
      label: t('pathFilters'),
      value: pathFilters.length,
    },
  ]

  return (
    <div className="data-extractor">
      <ExtractionControls 
        isExtracting={isExtracting}
        hasData={!!extractedData}
        onStart={startExtraction}
        onCancel={cancelExtraction}
        onClear={clearData}
      />
      
      {isExtracting ? (
        <ProgressIndicator progress={progress} />
      ) : (
        <ul className='text-sm text-gray-700 dark:text-gray-300 mt-4 flex items-center justify-center flex-wrap w-full divide-x divide-gray-700 dark:divide-gray-300'>
          {information.map((item) => (
            <li className='px-2' key={item.label}>{item.label}: <span className='aspect-square inline-flex w-5 h-5 items-center justify-center rounded-full bg-blue-500 text-white text-center'>{item.value}</span></li>
          ))}
        </ul>
      )}

      {
        !isExtracting && pathFilters.length === 0 &&
          <MessageBox
            title={t('noPathFiltersTitle')}
            variant='warning'
          >
            <p>{t('noPathFiltersMessage')}</p>
          </MessageBox>
      }
      
      {error && (
        <MessageBox
          title={t('errorTitle')}
          variant='critical'
        >
          <p>{error}</p>
        </MessageBox>
      )}
    </div>
  );
} 