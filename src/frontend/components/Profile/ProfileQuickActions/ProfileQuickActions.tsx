import React from 'react';
import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import {
  cardStyles,
  cardContentStyles,
  titleStyles,
  gridContainerStyles,
  actionItemStyles,
  actionTitleStyles,
  actionDescriptionStyles,
} from './ProfileQuickActions.styles';

interface QuickAction {
  title: string;
  description: string;
}

interface ProfileQuickActionsProps {
  actions: QuickAction[];
}

const ProfileQuickActions: React.FC<ProfileQuickActionsProps> = ({ actions }) => {
  return (
    <Card sx={cardStyles}>
      <CardContent sx={cardContentStyles}>
        <Typography variant="h6" sx={titleStyles}>
          Quick Actions
        </Typography>
        <Grid container sx={gridContainerStyles}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={actionItemStyles}>
                <Typography variant="subtitle1" sx={actionTitleStyles}>
                  {action.title}
                </Typography>
                <Typography variant="body2" sx={actionDescriptionStyles}>
                  {action.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProfileQuickActions; 