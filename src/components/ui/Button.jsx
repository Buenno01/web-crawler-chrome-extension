import React from 'react';

function Button({ children, ...props }) {
  return (
    <button className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full flex justify-center items-center gap-2 cursor-pointer text-xl' {...props}>
      {children}
    </button>
  )
}

export default Button;