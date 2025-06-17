import React from 'react'
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/ui/Button';
import { useDataExtractionContext } from '../contexts/dataExtractionContext';
import { AiOutlineClear } from "react-icons/ai";

function Storage() {
  const { t } = useTranslation();
  const { clearData } = useDataExtractionContext();

  return (
    <>
      <h1 className='text-2xl font-bold mb-4'>{t('storageTitle')}</h1>
      <div className='box'>
        <Button
          variant='danger'
          onClick={clearData}
        >
          <AiOutlineClear className='text-lg' />
          {t('storageClear')}
        </Button>
      </div>
    </>
  )
}

export default Storage