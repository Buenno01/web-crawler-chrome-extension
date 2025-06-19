import React from 'react';
import Button from './ui/Button';
import { IoMdTrash } from 'react-icons/io';

function FormItemsList({ values, removeFunction }) {
  return (
    <ul className="form-list">
      {
        values && values.length > 0 &&
        values.map((value) => (
          <li
            key={value}
            className="flex items-center gap-2 text-foreground-secondary bg-surface py-1 px-2 rounded-md"
          >
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

export default FormItemsList;