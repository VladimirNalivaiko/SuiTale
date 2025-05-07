import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { howItWorksSteps } from '../../data';

export const HowItWorks: React.FC = () => {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          How It Works
        </Typography>

        <Grid container spacing={6}>
          {howItWorksSteps.map((step) => (
            <Grid
              item
              xs={12}
              md={4}
              key={step.id}
              sx={{ textAlign: "center" }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  color: "white",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <Typography variant="h5">{step.id}</Typography>
              </Paper>
              <Typography variant="h6" gutterBottom>
                {step.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}; 