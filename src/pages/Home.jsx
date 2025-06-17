import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import DataExtractor from '../components/DataExtractor';

function Home() {
  const { t } = useTranslation();

  return (
    <>
      <h1 className='text-2xl font-bold mb-4'>{t('webCrawlerTitle')}</h1>
      <DataExtractor />
    </>
  )
}

export default Home;