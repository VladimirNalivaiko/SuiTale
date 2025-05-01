import { SxProps, Theme } from '@mui/material';

export const bannerStyles: SxProps<Theme> = {
  height: '200px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))',
  },
};

export const editBannerButtonStyles: SxProps<Theme> = {
  position: 'absolute',
  top: 16,
  right: 16,
  bgcolor: 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 1)',
  },
};

export const avatarContainerStyles: SxProps<Theme> = {
  position: 'relative',
  display: 'inline-block',
  marginTop: '-60px',
  marginLeft: '24px',
};

export const avatarStyles: SxProps<Theme> = {
  width: 120,
  height: 120,
  border: '4px solid white',
};

export const editAvatarButtonStyles: SxProps<Theme> = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  bgcolor: 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 1)',
  },
};

export const userInfoStyles: SxProps<Theme> = {
  padding: '24px',
};

export const userNameStyles: SxProps<Theme> = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '8px',
};

export const walletAddressStyles: SxProps<Theme> = {
  color: 'text.secondary',
  marginBottom: '4px',
};

export const joinDateStyles: SxProps<Theme> = {
  color: 'text.secondary',
}; 