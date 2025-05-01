import { SxProps, Theme } from '@mui/material';

export const cardStyles: SxProps<Theme> = {
  height: '100%',
};

export const cardContentStyles: SxProps<Theme> = {
  padding: '24px',
};

export const titleStyles: SxProps<Theme> = {
  marginBottom: '24px',
  color: 'primary.main',
  fontWeight: 'bold',
};

export const gridContainerStyles: SxProps<Theme> = {
  spacing: 4,
};

export const earningsItemStyles: SxProps<Theme> = {
  padding: '16px',
  borderRadius: '8px',
  bgcolor: 'background.paper',
  boxShadow: 2,
  margin: 1
};

export const earningsLabelStyles: SxProps<Theme> = {
  color: 'text.secondary',
  marginBottom: '8px',
};

export const earningsValueStyles: SxProps<Theme> = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: 'text.primary',
}; 