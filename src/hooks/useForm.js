import { useState } from 'react';

export default function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const resetValues = () => {
    setValues(initialValues);
  };

  return [ values, handleChange, resetValues ];
}