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

export const listStyles: SxProps<Theme> = {
  width: '100%',
};

export const listItemStyles: SxProps<Theme> = {
  py: 1.5,
  px: 2,
  borderBottom: '1px solid',
  borderColor: 'divider',
  '&:last-child': {
    borderBottom: 'none',
  },
};

export const notificationIconStyles: SxProps<Theme> = {
  color: 'primary.main',
  mr: 2,
};

export const notificationMessageStyles: SxProps<Theme> = {
  color: 'text.primary',
  fontWeight: 'medium',
};

export const notificationTimeStyles: SxProps<Theme> = {
  color: 'text.secondary',
  fontSize: '0.75rem',
}; 