import React from 'react';
import { IoMdTrash } from "react-icons/io";
import { useCssSelectorsContext } from '../contexts/cssSelectorsContext';
import { useTranslation } from '../hooks/useTranslation';
import useForm from '../hooks/useForm';
import Input from './ui/Input';
import Button from './ui/Button';

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

  return (
    <div className='flex flex-col gap-2 rounded-sm bg-blue-500/10 p-4'>
      <form onSubmit={handleSubmit}>
        <Input label={t('cssSelectorInputLabel')} name='selector' value={form.selector} onChange={handleChange} />
        <Button>
          {t('addCssSelectorButton')}
        </Button>
      </form>
      <ul className='flex flex-wrap gap-2'>
        {
            values.map((value) => (
                <li key={value} className='flex items-center justify-center gap-2 px-2 py-1 rounded-sm bg-blue-500/10 w-fit'>
                    {value}
                    <Button className='hover:bg-white/20 p-1 rounded-full cursor-pointer' onClick={() => remove(value)}>
                        <IoMdTrash />
                    </Button>
                </li>
            ))
        }
      </ul>
    </div>
  )
}

export default CSSSelectorForm