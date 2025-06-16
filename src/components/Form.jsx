import React from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import { FaPlus } from 'react-icons/fa';

function Form({ handleSubmit, handleInput, inputValue, inputName, buttonLabel, inputLabel }) {
  return (
    <form onSubmit={handleSubmit} className="form">
      <Input label={inputLabel} name={inputName} value={inputValue} onChange={handleInput} />
      <Button variant="icon" className='form__button' aria-label={buttonLabel}>
        <FaPlus className='icon' />
      </Button>
    </form>
  )
}

export default Form;