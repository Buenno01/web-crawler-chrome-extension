import React from 'react';

const BUTTON_TYPES = {
  disclosure: {
    type: 'disclosure',
    label: 'Collapse message',
  },
  close: {
    type: 'close',
    label: 'Close message',
  },
  none: {
    type: 'none',
    icon: null,
    label: null,
  },
}

function BoxHeader({
  children,
  handleToggle,
  buttonType = 'none',
}) {
  const mappedButtonType = BUTTON_TYPES[buttonType] || BUTTON_TYPES.none;

  return (
    <div
      className={`font-semibold mb-1 flex items-center justify-between ${mappedButtonType.type === 'disclosure' ? 'cursor-pointer' : ''}`}
      onClick={mappedButtonType.type === 'disclosure' ? handleToggle : undefined}
    >
      <div className="flex items-center gap-2 flex-grow justify-between">
        {children}
      </div>
    </div>
  )
}

export default BoxHeader;