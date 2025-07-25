import React from 'react';
import CSSSelectorForm from '../components/CSSSelectorForm';
import PathFilterForm from '../components/PathFilterForm';
import { useTranslation } from '../hooks/useTranslation';

function Settings() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>{t('settingsTitle')}</h1>
      <CSSSelectorForm />
      <PathFilterForm />
    </div>
  )
}

export default Settings;