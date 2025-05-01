import { SxProps, Theme } from '@mui/material';

export const selectStyles: SxProps<Theme> = {
  bgcolor: 'white',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4318d1',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4318d1',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4318d1',
  },
}; 