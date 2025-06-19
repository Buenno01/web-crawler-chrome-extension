import React, { useState } from 'react';
import { IoIosInformationCircle, IoMdCheckmarkCircle, IoMdWarning, IoMdAlert } from "react-icons/io";
import Box from './Box';

const variants = {
  info: {
    icon: IoIosInformationCircle,
    title: 'Information',
  },
  success: {
    icon: IoMdCheckmarkCircle,
    title: 'Success',
  },
  warning: {
    icon: IoMdWarning,
    title: 'Warning',
  },
  critical: {
    icon: IoMdAlert,
    title: 'Critical',
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
    <Box.Root 
      variant={variant}
      className={`flex-row ${className}`}
      role="alert"
      {...props}
    >
      <Box.Icon Icon={Icon} />
      <Box.ContentWrapper>
        <Box.Header
          buttonType={disclosure ? 'disclosure' : closeButton ? 'close' : 'none'}
          handleToggle={handleToggle}
          handleClose={handleClose}
          isExpanded={isExpanded}
        >
          {title || variantConfig.title}
        </Box.Header>
        <Box.Content
          className={`
            ${disclosure ? 'box__content--disclosure' : ''}
            ${isExpanded ? 'box__content--expanded' : ''}
          `}
        >
          {children}
        </Box.Content>
      </Box.ContentWrapper>
    </Box.Root>
  );
}

export default MessageBox; 