import { SxProps, Theme } from '@mui/material';

export const chipStyles: SxProps<Theme> = {
  '&:hover': {
    bgcolor: 'primary.light',
  },
};

export const stackStyles: SxProps<Theme> = {
  direction: 'row',
  spacing: 1,
  flexWrap: 'wrap',
  gap: 1,
}; 