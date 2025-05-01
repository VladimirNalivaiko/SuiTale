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

export const listStyles: SxProps<Theme> = {
  width: '100%',
};

export const listItemStyles: SxProps<Theme> = {
  padding: '16px',
  borderBottom: '1px solid',
  borderColor: 'divider',
  '&:last-child': {
    borderBottom: 'none',
  },
};

export const projectTitleStyles: SxProps<Theme> = {
  color: 'text.primary',
  fontWeight: 'medium',
};

export const lastEditedStyles: SxProps<Theme> = {
  color: 'text.secondary',
  fontSize: '0.875rem',
};

export const progressBarStyles: SxProps<Theme> = {
  height: 8,
  borderRadius: 4,
  marginTop: 1,
};

export const progressBarRootStyles: SxProps<Theme> = {
  bgcolor: 'background.paper',
}; 