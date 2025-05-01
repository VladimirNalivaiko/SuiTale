import React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import {
  cardStyles,
  cardContentStyles,
  titleStyles,
  gridContainerStyles,
  earningsItemStyles,
  earningsLabelStyles,
  earningsValueStyles,
} from './ProfileEarnings.styles';

interface EarningsItem {
  label: string;
  value: string | number;
}

interface ProfileEarningsProps {
  earnings: EarningsItem[];
}

const ProfileEarnings: React.FC<ProfileEarningsProps> = ({ earnings }) => {
  return (
    <Card sx={cardStyles}>
      <CardContent sx={cardContentStyles}>
        <Typography variant="h6" sx={titleStyles}>
          Earnings
        </Typography>
        <Grid container sx={gridContainerStyles}>
          {earnings.map((item, index) => (
            <Grid item xs={12} sm={12} md={12} lg={6} xl={4} key={index}>
              <Box sx={earningsItemStyles}>
                <Typography variant="body2" sx={earningsLabelStyles}>
                  {item.label}
                </Typography>
                <Typography variant="h4" sx={earningsValueStyles}>
                  {item.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProfileEarnings; 