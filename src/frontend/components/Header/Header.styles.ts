import { SxProps, Theme } from '@mui/material';

export const appBarStyles: SxProps<Theme> = {
  position: 'static',
  color: 'transparent',
  elevation: 0,
};

export const toolbarStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 2,
};

export const logoContainerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
};

export const logoStyles: SxProps<Theme> = {
  mr: 1,
};

export const navigationStackStyles: SxProps<Theme> = {
  display: 'flex',
  mr: 4,
  spacing: 3,
  flexWrap: 'wrap',
};

export const mobileMenuButtonStyles: SxProps<Theme> = {
  display: { xs: 'block', sm: 'none' },
};

export const mobileMenuStyles: SxProps<Theme> = {
  display: { xs: 'block', sm: 'none' },
};

export const mobileMenuPaperStyles: SxProps<Theme> = {
  width: '100%',
  maxWidth: '100%',
  mt: 1,
};

export const mobileMenuItemStyles: SxProps<Theme> = {
  py: 1,
  px: 2,
};

export const actionsContainerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
}; 