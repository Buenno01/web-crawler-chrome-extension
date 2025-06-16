import React from 'react'

function Input({ label, className = '', ...props }) {
  return (
    <div className="form__group">
      <input
        {...props}
        id={props.id}
        placeholder=" "
        className={`input peer ${className}`}
      />
      <label
        htmlFor={props.id}
        className="input__label"
      >
        {label}
      </label>
    </div>
  )
}

export default Input