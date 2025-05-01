import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';

interface QuickAction {
  title: string;
  description: string;
}

interface ProfileQuickActionsProps {
  data: QuickAction[];
}

export const ProfileQuickActions: React.FC<ProfileQuickActionsProps> = ({ data }) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 3, fontWeight: "bold", color: "#4318d1" }}
        >
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {data.map((action, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 1,
                  bgcolor: "#f7f7ff",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 1, fontWeight: "bold", color: "#4318d1" }}
                >
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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