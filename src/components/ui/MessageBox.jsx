import React, { useState } from 'react';
import { IoIosInformationCircle, IoMdCheckmarkCircle, IoMdWarning, IoMdAlert, IoIosClose } from "react-icons/io";
import { RxCaretDown } from "react-icons/rx";
import Button from './Button';

const variants = {
  info: {
    icon: IoIosInformationCircle,
    title: 'Information',
    className: 'message-box--info'
  },
  success: {
    icon: IoMdCheckmarkCircle,
    title: 'Success',
    className: 'message-box--success'
  },
  warning: {
    icon: IoMdWarning,
    title: 'Warning',
    className: 'message-box--warning'
  },
  critical: {
    icon: IoMdAlert,
    title: 'Critical',
    className: 'message-box--critical'
  }
};

function MessageBox({ 
  children, 
  variant = 'info', 
  title,
  className = '',
  onClose,
  closeButton = true,
  disclosure = false,
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(!disclosure);
  const variantConfig = variants[variant] || variants.info;
  const Icon = variantConfig.icon;
  
  if (!isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div 
      className={`message-box ${variantConfig.className} ${className}`}
      role="alert"
      {...props}
    >
      <div className="message-box__icon-wrapper">
        <Icon className="icon" />
      </div>
      <div className="message-box__content">
        <div
          className={`message-box__title ${disclosure ? 'message-box__title--disclosure' : ''}`}
          onClick={disclosure ? handleToggle : undefined}
        >
          <div className="message-box__title-content">
            {title || variantConfig.title}
          </div>
          {disclosure && (
              <Button
                variant="icon"
                onClick={handleToggle}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Collapse message" : "Expand message"}
                className={`message-box__toggle ${isExpanded ? 'message-box__toggle--expanded' : ''}`}
              >
                <RxCaretDown className="icon" />
              </Button>
            )}
          {closeButton && disclosure === false && (
            <Button
              variant="icon"
              onClick={handleClose}
              aria-label="Close message"
            >
              <IoIosClose className="icon" />
            </Button>
          )}
        </div>
        <div className={`message-box__text ${disclosure ? 'message-box__text--disclosure' : ''} ${isExpanded ? 'message-box__text--expanded' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default MessageBox; 