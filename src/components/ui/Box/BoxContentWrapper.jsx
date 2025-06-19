import React from 'react'

function BoxContentWrapper({ children, className = '', ...props }) {
  return (
    <div className={`box__content-wrapper ${className}`} {...props}>
      {children}
    </div>
  )
}

export default BoxContentWrapper