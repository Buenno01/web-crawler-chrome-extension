import React, { useState } from 'react';
import Box from './Box';
import Icon from './Icon';

const variants = {
  info: {
    icon: Icon.info,
    title: 'Information',
  },
  success: {
    icon: Icon.success,
    title: 'Success',
  },
  warning: {
    icon: Icon.warning,
    title: 'Warning',
  },
  critical: {
    icon: Icon.critical,
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
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const variantConfig = variants[variant] || variants.info;
  const variantIcon = variantConfig.icon;
  
  if (!isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Box.Root 
      variant={variant}
      className={`flex-row ${className}`}
      role="alert"
      {...props}
    >
      <Box.Icon Icon={variantIcon} />
      <Box.ContentWrapper>
        <Box.Header
          buttonType={closeButton ? 'close' : 'none'}
          handleClose={handleClose}
        >
          {title || variantConfig.title}
          {closeButton && (
            <Button
              variant="icon"
              onClick={handleClose}
              aria-label='Close message'
              className="p-0"
            >
              <Icon.close className={`text-lg transition-transform duration-300 ease-in-out`} />
            </Button>
          )}
        </Box.Header>
        <Box.Content>
          {children}
        </Box.Content>
      </Box.ContentWrapper>
    </Box.Root>
  );
}

export default MessageBox; 