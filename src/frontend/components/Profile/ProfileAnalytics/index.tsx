import React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  cardStyles,
  cardContentStyles,
  titleStyles,
  gridContainerStyles,
  analyticsItemStyles,
  analyticsLabelStyles,
  analyticsValueStyles,
  analyticsIncreaseStyles,
} from './ProfileAnalytics.styles';

interface AnalyticsItem {
  label: string;
  value: string | number;
  increase?: number;
}

interface ProfileAnalyticsProps {
  items: AnalyticsItem[];
}

const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({ items }) => {
  return (
    <Card sx={cardStyles}>
      <CardContent sx={cardContentStyles}>
        <Typography variant="h6" sx={titleStyles}>
          Analytics
        </Typography>
        <Grid container sx={gridContainerStyles}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={analyticsItemStyles}>
                <Typography variant="body2" sx={analyticsLabelStyles}>
                  {item.label}
                </Typography>
                <Typography variant="h4" sx={analyticsValueStyles}>
                  {item.value}
                </Typography>
                {item.increase && (
                  <Box sx={analyticsIncreaseStyles}>
                    <TrendingUpIcon fontSize="small" />
                    <Typography variant="body2">
                      {item.increase}% from last month
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProfileAnalytics; 