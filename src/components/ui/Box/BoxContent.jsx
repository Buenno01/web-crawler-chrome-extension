import React from 'react'

function BoxContent({ children, className = '', ...props }) {
  return (
    <div className={`box__content ${className}`} {...props}>
      {children}
    </div>
  )
}

export default BoxContent