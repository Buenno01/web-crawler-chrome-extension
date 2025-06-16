import React from 'react'
import Button from './ui/Button';
import { IoMdTrash } from 'react-icons/io';

function FormItemsList({ values, removeFunction }) {
  return (
    <ul className="form-list">
      {
        values.map((value) => (
          <li key={value} className="form-item">
            {value}
            <Button variant="icon" className="button--icon" onClick={() => removeFunction(value)}>
              <IoMdTrash />
            </Button>
          </li>
        ))
      }
    </ul>
  )
}

export default FormItemsList