import React from 'react'
import { useTranslation } from '../hooks/useTranslation';
import { usePathFiltersContext } from '../contexts/pathFiltersContext';
import useForm from '../hooks/useForm';
import Form from './Form';
import FormItemsList from './FormItemsList';
import MessageBox from './ui/MessageBox';

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
    <div className="box">
      <h2 className="page-title">{t('pathFilterFormTitle')}</h2>
      <Form
        handleSubmit={handleSubmit}
        handleInput={handleInput}
        inputValue={form.filter}
        inputName='filter'
        buttonLabel={t('addPathFilterButton')}
        inputLabel={t('pathFilterInputLabel')}
      />
      <FormItemsList values={values} removeFunction={remove} />
      <MessageBox
        title={t('pathFilterFormDescriptionTitle')}
        variant="info"
        disclosure={true}
      >
        <p>
          {t('pathFilterFormDescription')}
        </p>
      </MessageBox>
    </div>
  )
}

export default PathFilterForm