import { SxProps, Theme } from '@mui/material';

export const cardStyles: SxProps<Theme> = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
};

export const cardContentStyles: SxProps<Theme> = {
  flexGrow: 1,
};

export const titleStyles: SxProps<Theme> = {
  color: '#4318d1',
  fontWeight: 'bold',
};

export const statsBoxStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const readButtonStyles: SxProps<Theme> = {
  bgcolor: '#4318d1',
  color: '#fff',
  '&:hover': {
    bgcolor: '#3a14b8',
  },
}; 