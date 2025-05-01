import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';

interface AnalyticsItem {
  label: string;
  value: string;
  increase: string;
}

interface ProfileAnalyticsProps {
  data: AnalyticsItem[];
}

export const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({ data }) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: "bold", color: "#4318d1" }}
        >
          Analytics
        </Typography>
        <Grid container spacing={2}>
          {data.map((item, index) => (
            <Grid item xs={12} sm={12} md={6} lg={3} key={index}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: "#f7f7ff",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: "#4318d1" }}
                >
                  {item.value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6d28ff",
                    fontWeight: "bold",
                  }}
                >
                  {item.increase}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}; 