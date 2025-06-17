import React, { useState, useEffect } from 'react'
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/ui/Button';
import { useDataExtractionContext } from '../contexts/dataExtractionContext';
import { AiOutlineClear, AiOutlineCheckCircle } from "react-icons/ai";
import { formatBytes } from '../utils/formatBytes';


function Storage() {
  const { t } = useTranslation();
  const { clearData } = useDataExtractionContext();
  const [cleared, setCleared] = useState(false);
  const [formattedUsedStorage, setFormattedUsedStorage] = useState('0 bytes');
  const [loading, setLoading] = useState(true);

  const handleClearStorage = () => {
    clearData();
    setCleared(true);
    getUsedStorage();
  }

  useEffect(() => {
    getUsedStorage();
  }, []);

  const getUsedStorage = async () => {
    /* If it is too quick, wait 0.5 seconds */
    try {
      const timer = Date.now();
      setLoading(true);
      const bytes = await chrome.storage.local.getBytesInUse(null);
      const timeElapsed = Date.now() - timer;
      if (timeElapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - timeElapsed));
      }
      setFormattedUsedStorage(formatBytes(bytes));
      setLoading(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className='text-2xl font-bold mb-4'>{t('storageTitle')}</h1>
      <div className='box'>
        <div className='flex flex-col gap-2'>
          {
            loading ? (
              <p>{t('storageLoading')}</p>
            ) : (
              <p>{t('storageUsed')}: {formattedUsedStorage}</p>
            )
          }
        </div>
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