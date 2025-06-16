import React from 'react';
import { IoIosInformationCircle, IoMdCheckmarkCircle, IoMdWarning, IoMdAlert } from "react-icons/io";

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
  ...props 
}) {
  const variantConfig = variants[variant] || variants.info;
  const Icon = variantConfig.icon;
  
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
        <div className="message-box__title">
          {title || variantConfig.title}
        </div>
        <div className="message-box__text">
          {children}
        </div>
      </div>
    </div>
  );
}

export default MessageBox; 