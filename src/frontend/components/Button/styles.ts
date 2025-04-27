import styled from 'styled-components';

export const StyledButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  background-color: ${props => props.theme.palette.primary.main};
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.theme.palette.primary.dark};
  }

  &:disabled {
    background-color: ${props => props.theme.palette.grey[400]};
    cursor: not-allowed;
  }
`; 