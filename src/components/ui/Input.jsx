import React from 'react'

function Input({ label, ...props }) {
  return (
    <div className="relative">
      <input
        {...props}
        id={props.id}
        placeholder=" "
        className="peer w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2
          focus:border-blue-500 focus:dark:border-blue-500 focus:outline-none pt-6 pb-2"
      />
      <label
        htmlFor={props.id}
        className="absolute text-gray-700 dark:text-gray-300 duration-150 transform -translate-y-3 scale-75 top-2 z-10 origin-[0] 
          left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2 pt-1
          peer-focus:scale-75 peer-focus:-translate-y-3"
      >
        {label}
      </label>
    </div>
  )
}

export default Input