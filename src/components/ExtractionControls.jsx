import React from 'react';
import { BsBoxArrowRight } from "react-icons/bs";
import { useTranslation } from '../hooks/useTranslation';
import Button from './ui/Button';
import MessageBox from './ui/MessageBox';
import Box from './ui/Box';

export default function ExtractionControls({
  isExtracting,
  hasData,
  onStart,
  onCancel,
}) {
  const { t } = useTranslation();

  return (
    <Box.Root>
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
          className='mt-1'
        >
          <p>{t('extractionCompletedMessage')}</p>
        </MessageBox>
      )}
    </Box.Root>
  );
}
