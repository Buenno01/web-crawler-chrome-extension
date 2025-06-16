import React from 'react';
import { useCssSelectorsContext } from '../contexts/cssSelectorsContext';
import { usePathFiltersContext } from '../contexts/pathFiltersContext';
import { useTranslation } from '../hooks/useTranslation';
import MessageBox from '../components/ui/MessageBox';
import DataExtractor from '../components/DataExtractor';

function Home() {
  const { values: cssSelectors } = useCssSelectorsContext();
  const { values: pathFilters } = usePathFiltersContext();
  const { t } = useTranslation();

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
    <>
      <h1 className='text-2xl font-bold mb-4'>{t('webCrawlerTitle')}</h1>
      <div className='flex flex-col gap-2 mb-4 text-sm italic text-gray-700 dark:text-gray-300'>
        <p>
          <strong>{t('attentionLabel')}:</strong> {t('attentionMessage')}
        </p>
      </div>

      <DataExtractor />
    </>
  )
}

export default Home;