import React from 'react';
import { Box, Avatar, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import {
  bannerStyles,
  editBannerButtonStyles,
  avatarContainerStyles,
  avatarStyles,
  editAvatarButtonStyles,
  userInfoStyles,
  userNameStyles,
  walletAddressStyles,
  joinDateStyles,
} from './ProfileHeader.styles';

interface ProfileHeaderProps {
  name: string;
  wallet: string;
  joinDate: string;
  onEditBanner?: () => void;
  onEditAvatar?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  wallet,
  joinDate,
  onEditBanner,
  onEditAvatar,
}) => {
  return (
    <Box>
      <Box sx={bannerStyles}>
        {onEditBanner && (
          <IconButton onClick={onEditBanner} sx={editBannerButtonStyles}>
            <EditIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={avatarContainerStyles}>
        <Avatar
          src="https://via.placeholder.com/120"
          alt={name}
          sx={avatarStyles}
        />
        {onEditAvatar && (
          <IconButton onClick={onEditAvatar} sx={editAvatarButtonStyles}>
            <EditIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={userInfoStyles}>
        <Typography variant="h4" sx={userNameStyles}>
          {name}
        </Typography>
        <Typography variant="body1" sx={walletAddressStyles}>
          {wallet}
        </Typography>
        <Typography variant="body2" sx={joinDateStyles}>
          Joined {joinDate}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProfileHeader; 