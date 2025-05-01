import React from 'react';
import {
  Avatar,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface ProfileHeaderProps {
  name: string;
  wallet: string;
  joinDate: string;
  onEditBanner?: () => void;
  onEditAvatar?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  wallet,
  joinDate,
  onEditBanner,
  onEditAvatar,
}) => {
  return (
    <Box sx={{ position: "relative" }}>
      {/* Banner */}
      <Box
        sx={{
          height: 300,
          bgcolor: "#d9d9d9",
          position: "relative",
        }}
      >
        <IconButton
          onClick={onEditBanner}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: "white",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Avatar and Info */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        p: { xs: 2, sm: 3, md: 4 }, 
      }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            sx={{
              width: 160,
              height: 160,
              border: "4px solid white",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              bgcolor: "#d9d9d9",
            }}
          />
          <IconButton
            onClick={onEditAvatar}
            sx={{
              position: "absolute",
              bottom: -8,
              left: 120,
              bgcolor: "white",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ ml: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#4318d1" }}
          >
            {name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Typography variant="body1" color="text.secondary">
              {wallet}
            </Typography>
            <Box
              sx={{
                width: 4,
                height: 4,
                bgcolor: "#666666",
                borderRadius: "50%",
                mx: 2,
              }}
            />
            <Typography variant="body1" color="text.secondary">
              Joined {joinDate}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}; 