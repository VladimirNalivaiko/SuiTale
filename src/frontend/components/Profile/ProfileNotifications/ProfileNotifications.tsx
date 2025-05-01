import React from 'react';
import { Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import {
  cardStyles,
  cardContentStyles,
  titleStyles,
  listStyles,
  listItemStyles,
  notificationIconStyles,
  notificationMessageStyles,
  notificationTimeStyles,
} from './ProfileNotifications.styles';

interface Notification {
  icon: React.ReactNode;
  message: string;
  time: string;
}

interface ProfileNotificationsProps {
  notifications: Notification[];
}

const ProfileNotifications: React.FC<ProfileNotificationsProps> = ({ notifications }) => {
  return (
    <Card sx={cardStyles}>
      <CardContent sx={cardContentStyles}>
        <Typography variant="h6" sx={titleStyles}>
          Notifications
        </Typography>
        <List sx={listStyles}>
          {notifications.map((notification, index) => (
            <ListItem key={index} sx={listItemStyles}>
              <ListItemIcon sx={notificationIconStyles}>
                {notification.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={notificationMessageStyles}>
                    {notification.message}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={notificationTimeStyles}>
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

export default ProfileNotifications; 