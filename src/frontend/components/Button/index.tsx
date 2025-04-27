import React from 'react';
import { StyledButton } from './styles';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
}) => {
  return (
    <StyledButton
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </StyledButton>
  );
}; 