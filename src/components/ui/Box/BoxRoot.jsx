import React from 'react';

function BoxRoot({ 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}) {
  return (
    <div 
      className={`box box--${variant} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default BoxRoot;
