import React, { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/ui/Button';
import { useDataExtractionContext } from '../contexts/dataExtractionContext';
import { AiOutlineClear, AiOutlineCheckCircle } from "react-icons/ai";


function Storage() {
  const { t } = useTranslation();
  const { clearData } = useDataExtractionContext();
  const [cleared, setCleared] = useState(false);

  const handleClearStorage = () => {
    clearData();
    setCleared(true);
  }

  return (
    <>
      <h1 className='text-2xl font-bold mb-4'>{t('storageTitle')}</h1>
      <div className='box'>
        <Button
          variant={ cleared ? 'success' : 'danger'}
          onClick={handleClearStorage}
        >
          {
            cleared ? (
              <>
                <AiOutlineCheckCircle className='text-lg' />
                {t('storageCleared')}
              </>
            ) : (
              <>
                <AiOutlineClear className='text-lg' />
                {t('storageClear')}
              </>
            )
          }
        </Button>
      </div>
    </>
  )
}

export default Storage