import React from 'react'
import { useTranslation } from '../hooks/useTranslation';
import { usePathFiltersContext } from '../contexts/pathFiltersContext';
import useForm from '../hooks/useForm';
import Form from './Form';
import FormItemsList from './FormItemsList';
import Box from './ui/Box';
import DisclosureBox from './ui/DisclosureBox';

function PathFilterForm() {
  const { values, add, remove } = usePathFiltersContext();
  const { t } = useTranslation();
  const [ form, handleChange, resetForm ] = useForm({
    filter: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    add(e.target.filter.value);
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
      <h2>{t('pathFilterFormTitle')}</h2>
      <Form
        handleSubmit={handleSubmit}
        handleInput={handleInput}
        inputValue={form.filter}
        inputName='filter'
        buttonLabel={t('addPathFilterButton')}
        inputLabel={t('pathFilterInputLabel')}
      />
      <FormItemsList values={values} removeFunction={remove} />
      <DisclosureBox
        title={t('pathFilterFormDescriptionTitle')}
        variant="info"
        className='mt-2'
      >
        <p>
          {t('pathFilterFormDescription')}
        </p>
      </DisclosureBox>
    </Box.Root>
  )
}

export default PathFilterForm