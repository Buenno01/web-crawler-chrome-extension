import React from 'react';

function BoxIcon({ Icon, className = '' }) {
  return (
    <div className={`flex-shrink-0 px-1 ${className}`}>
      <Icon className="text-lg mt-0.5 text-accent" />
    </div>
  );
}

export default BoxIcon;