import React from 'react';

function BoxRoot({ 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}) {
  const schemes = {
    success: 'scheme-success',
    critical: 'scheme-critical',
    info: 'scheme-info',
    warning: 'scheme-warning',
    primary: 'scheme-primary',
    highlight: 'scheme-highlight',
    muted: 'scheme-muted',
  }
  return (
    <div 
      className={`box ${schemes[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default BoxRoot;
