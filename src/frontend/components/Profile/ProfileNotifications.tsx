import React from 'react';
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';

interface Notification {
  icon: React.ReactNode;
  message: string;
  time: string;
}

interface ProfileNotificationsProps {
  data: Notification[];
}

export const ProfileNotifications: React.FC<ProfileNotificationsProps> = ({ data }) => {
  return (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: "bold", color: "#4318d1" }}
        >
          Notifications
        </Typography>
        <List>
          {data.map((notification, index) => (
            <ListItem
              key={index}
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": {
                  borderBottom: "none",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#4318d1" }}>
                {notification.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#4318d1" }}
                  >
                    {notification.message}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {notification.time}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}; 