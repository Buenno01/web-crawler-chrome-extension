import React from 'react';
import { BsBoxArrowRight } from "react-icons/bs";
import { useTranslation } from '../hooks/useTranslation';
import Button from './ui/Button';
import MessageBox from './ui/MessageBox';

export default function ExtractionControls({
  isExtracting,
  hasData,
  onStart,
  onCancel,
}) {
  const { t } = useTranslation();

  return (
    <div className="box">
      <Button
        onClick={isExtracting ? onCancel : onStart}
        variant={isExtracting ? 'danger' : 'primary'}
      >
        <BsBoxArrowRight className='text-lg' />
        {isExtracting ? t('cancelExtraction') : t('startExtraction')}
      </Button>

      {hasData && !isExtracting && (
        <MessageBox
          title={t('extractionCompletedTitle')}
          variant='success'
        >
          <p>{t('extractionCompletedMessage')}</p>
        </MessageBox>
      )}
    </div>
  );
}
