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
  analytics: AnalyticsItem[];
}

const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({ analytics }) => {
  return (
    <Card sx={cardStyles}>
      <CardContent sx={cardContentStyles}>
        <Typography variant="h6" sx={titleStyles}>
          Analytics
        </Typography>
        <Grid container sx={gridContainerStyles}>
          {analytics.map((item, index) => (
            <Grid item xs={12} sm={12}  md={12} lg={6} xl={3} key={index}>
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