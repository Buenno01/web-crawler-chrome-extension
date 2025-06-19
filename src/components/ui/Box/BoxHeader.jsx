import React from 'react';
import { RxCaretDown } from "react-icons/rx";
import { IoIosClose } from "react-icons/io";
import Button from '../Button';

const BUTTON_TYPES = {
  disclosure: {
    type: 'disclosure',
    icon: <RxCaretDown className="icon" />,
    label: 'Collapse message',
  },
  close: {
    type: 'close',
    icon: <IoIosClose className="icon" />,
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

  const disclosureClass = buttonType === 'disclosure'
  ? 'box__header--disclosure' 
  :  '';

  return (
    <div
      className={`box__header ${disclosureClass}`}
      onClick={buttonType === 'disclosure' ? handleToggle : undefined}
    >
      <div className="box__header-content">
        {children}
      </div>
      {mappedButtonType.type !== 'none' && (
          <Button
            variant="icon"
            onClick={handleButtonClick}
            aria-expanded={mappedButtonType.type === 'disclosure' ? isExpanded : undefined}
            aria-label={mappedButtonType.label}
            className={
              mappedButtonType.type === 'disclosure' 
              ? `box__toggle ${isExpanded 
                ? 'box__toggle--expanded' 
                : ''}` 
              : ''
            }
          >
            {mappedButtonType.icon}
          </Button>
        )}
    </div>
  )
}

export default BoxHeader;