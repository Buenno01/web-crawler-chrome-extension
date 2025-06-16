import React from 'react';
import { BsBoxArrowRight } from "react-icons/bs";
import { useCssSelectorsContext } from '../contexts/cssSelectorsContext';
import { usePathFiltersContext } from '../contexts/pathFiltersContext';
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/ui/Button';

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

      <Button>
        <BsBoxArrowRight className='text-lg' />
        {t('startExtraction')}
      </Button>
      <ul className='text-sm text-gray-700 dark:text-gray-300 mt-4 flex items-center justify-center flex-wrap w-full divide-x divide-gray-700 dark:divide-gray-300'>
        {information.map((item) => (
          <li className='px-2' key={item.label}>{item.label}: <span className='aspect-square inline-flex w-5 h-5 items-center justify-center rounded-full bg-blue-500 text-white text-center'>{item.value}</span></li>
        ))}
      </ul>
    </>
  )
}

export default Home;