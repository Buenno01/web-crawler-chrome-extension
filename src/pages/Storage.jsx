import React from 'react'
import { useTranslation } from '../hooks/useTranslation';

function Storage() {
  const { t } = useTranslation();

  return (
    <>
      <h1 className='text-2xl font-bold mb-4'>{t('storageTitle')}</h1>
    </>
  )
}

export default Storage