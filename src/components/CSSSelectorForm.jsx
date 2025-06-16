import React from 'react';
import { IoMdTrash } from "react-icons/io";
import { useCssSelectorsContext } from '../contexts/cssSelectorsContext';
import { useTranslation } from '../hooks/useTranslation';
import useForm from '../hooks/useForm';
import Input from './ui/Input';
import Button from './ui/Button';
import { FaPlus } from "react-icons/fa";
import Form from './Form';
import FormItemsList from './FormItemsList';

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
    <div className="box">
      <h2 className="page-title">{t('cssSelectorFormTitle')}</h2>
      <Form
        handleSubmit={handleSubmit}
        handleInput={handleInput}
        inputValue={form.selector}
        inputName='selector'
        buttonLabel={t('addCssSelectorButton')}
        inputLabel={t('cssSelectorInputLabel')}
      />
      <FormItemsList values={values} removeFunction={remove} />
    </div>
  )
}

export default CSSSelectorForm