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
  const [usedStorage, setUsedStorage] = useState(0);
  const [formattedUsedStorage, setFormattedUsedStorage] = useState('0 bytes');

  const handleClearStorage = () => {
    clearData();
    setCleared(true);
  }

  useEffect(() => {
    const getUsedStorage = async () => {
      const bytes = await chrome.storage.local.getBytesInUse(null);
      setUsedStorage(bytes);
      setFormattedUsedStorage(formatBytes(bytes));
    }
    getUsedStorage();
  }, []);

  return (
    <>
      <h1 className='text-2xl font-bold mb-4'>{t('storageTitle')}</h1>
      <div className='box'>
        <div className='flex flex-col gap-2'>
          <p>{t('storageUsed')}: {formattedUsedStorage}</p>
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