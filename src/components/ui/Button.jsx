import React from 'react';

function Button({ children, variant = 'info', className = '', ...props }) {
  const schemes = {
    primary: 'scheme-primary',
    secondary: 'scheme-secondary',
    success: 'scheme-success',
    critical: 'scheme-critical',
    warning: 'scheme-warning',
    info: 'scheme-info',
    neutral: 'scheme-neutral',
    icon: 'button--icon',
  }

  const variantClass = variant === 'icon' ? `button--icon` : schemes[variant];
  
  return (
    <button 
      className={`button ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;