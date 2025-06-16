import React from 'react';

function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseClasses = 'button';
  const variantClass = variant ? `button--${variant}` : 'button--primary';
  
  return (
    <button 
      className={`${baseClasses} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;