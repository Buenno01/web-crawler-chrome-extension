import React from 'react';
import { useCssSelectorsContext } from '../contexts/cssSelectorsContext';
import { useTranslation } from '../hooks/useTranslation';
import useForm from '../hooks/useForm';
import Form from './Form';
import FormItemsList from './FormItemsList';
import Box from './ui/Box';
import DisclosureBox from './ui/DisclosureBox';

function CSSSelectorForm() {
  const { values, add, remove } = useCssSelectorsContext();
  const { t } = useTranslation();
  const [ form, handleChange, resetForm ] = useForm({
    selector: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    add(e.target.selector.value);
    resetForm();
  }

  const handleInput = (e) => {
    e.preventDefault();
    if (e.key === 'Enter') {
      handleSubmit(e);
    } else {
      handleChange(e);
    }
  }

  return (
    <Box.Root>
      <h2>{t('cssSelectorFormTitle')}</h2>
      <Form
        handleSubmit={handleSubmit}
        handleInput={handleInput}
        inputValue={form.selector}
        inputName='selector'
        buttonLabel={t('addCssSelectorButton')}
        inputLabel={t('cssSelectorInputLabel')}
      />
      <FormItemsList values={values} removeFunction={remove} />
      <DisclosureBox
        title={t('cssSelectorFormDescriptionTitle')}
        variant="info"
        className='mt-2'
      >
        <p>{t('cssSelectorFormDescription')}</p>
      </DisclosureBox>
    </Box.Root>
  )
}

export default CSSSelectorForm