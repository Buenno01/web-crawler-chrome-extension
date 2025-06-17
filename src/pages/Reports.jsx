import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useDataExtractionContext } from '../contexts/dataExtractionContext';
import MessageBox from '../components/ui/MessageBox';
import ReportMenu from '../components/ReportMenu';

function Reports() {
  const { t } = useTranslation();
  const { extractedData } = useDataExtractionContext();

  return (
    <>
      <h1 className='text-2xl font-bold mb-4'>{t('reportsTitle')}</h1>
      {
        !extractedData && (
          <MessageBox
            title={t('noDataTitle')}
            variant='info'
            disclosure={false}
            closeButton={false}
          >
            <p>{t('noDataDescription')}</p>
          </MessageBox>
        )
      }
      {
        extractedData && (
          <ReportMenu />
        )
      }
    </>
  )
}

export default Reports;