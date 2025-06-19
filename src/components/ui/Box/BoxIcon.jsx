import React from 'react';

function BoxIcon({ Icon, className = '' }) {
  return (
    <div className={`box__icon-wrapper icon pt-0.5 px-1 ${className}`}>
      <Icon />
    </div>
  );
}

export default BoxIcon;