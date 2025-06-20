import React, { useState } from 'react';
import Box from './Box';
import Icon from './Icon';
import Button from './Button';

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

function DisclosureBox({ 
  children, 
  variant = 'info', 
  title,
  className = '',
  hideIcon = false,
  ...props 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const variantConfig = variants[variant] || variants.info;
  const variantIcon = variantConfig.icon;

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
      {!hideIcon && <Box.Icon Icon={variantIcon} />}
      <Box.ContentWrapper>
        <Box.Header
          buttonType='disclosure'
          handleToggle={handleToggle}
          isExpanded={isExpanded}
        >
          {title || variantConfig.title}
          <Button
            variant="icon"
            onClick={handleToggle}
            aria-expanded={isExpanded}
            aria-label='Collapse message'
            className="p-0"
          >
            <Icon.caretDown className={`text-lg transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </Box.Header>
        <Box.Content
          className={`box__content--disclosure ${isExpanded ? 'box__content--expanded' : ''}`}
        >
          {children}
        </Box.Content>
      </Box.ContentWrapper>
    </Box.Root>
  );
}

export default DisclosureBox; 