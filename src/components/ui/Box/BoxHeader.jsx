import React from 'react';
import { RxCaretDown } from "react-icons/rx";
import { IoIosClose } from "react-icons/io";
import Button from '../Button';

const BUTTON_TYPES = {
  disclosure: {
    type: 'disclosure',
    icon: RxCaretDown,
    label: 'Collapse message',
  },
  close: {
    type: 'close',
    icon: IoIosClose,
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
  handleClose,
  isExpanded,
  buttonType = 'none',
}) {
  const mappedButtonType = BUTTON_TYPES[buttonType] || BUTTON_TYPES.none;

  const handleButtonClick = () => {
    if (mappedButtonType.type === 'disclosure') {
      handleToggle();
    } else if (mappedButtonType.type === 'close') {
      handleClose();
    }
  }

  return (
    <div
      className={`font-semibold mb-1 flex items-center justify-between ${mappedButtonType.type === 'disclosure' ? 'cursor-pointer' : ''}`}
      onClick={mappedButtonType.type === 'disclosure' ? handleToggle : undefined}
    >
      <div className="flex items-center gap-2 flex-grow justify-between">
        {children}
      </div>
      {mappedButtonType.type !== 'none' && (
          <Button
            variant="icon"
            onClick={handleButtonClick}
            aria-expanded={mappedButtonType.type === 'disclosure' ? isExpanded : undefined}
            aria-label={mappedButtonType.label}
            className="p-0"
          >
            <mappedButtonType.icon className={`text-lg transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        )}
    </div>
  )
}

export default BoxHeader;