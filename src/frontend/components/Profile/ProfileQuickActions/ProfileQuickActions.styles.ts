import { SxProps, Theme } from '@mui/material';

export const cardStyles: SxProps<Theme> = {
  height: '100%',
};

export const cardContentStyles: SxProps<Theme> = {
  p: 3,
};

export const titleStyles: SxProps<Theme> = {
  mb: 3,
  color: 'text.primary',
  fontWeight: 'bold',
};

export const gridContainerStyles: SxProps<Theme> = {
  spacing: 2,
};

export const actionItemStyles: SxProps<Theme> = {
  p: 2,
  borderRadius: 1,
  bgcolor: 'background.paper',
  boxShadow: 1,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: 2,
  },
};

export const actionTitleStyles: SxProps<Theme> = {
  color: 'text.primary',
  fontWeight: 'bold',
  mb: 1,
};

export const actionDescriptionStyles: SxProps<Theme> = {
  color: 'text.secondary',
  fontSize: '0.875rem',
}; 