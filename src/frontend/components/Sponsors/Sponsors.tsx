import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import CoffeeIcon from '@mui/icons-material/Coffee';

// Sponsors logos
const sponsors = [
  { id: 1, name: 'Cup of coffee', icon: <CoffeeIcon fontSize="large" /> },
];

export const Sponsors: React.FC = () => {
  return (
    <Box 
      sx={{ 
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          component="h2"
          align="center"
          variant="h3"
          color="text.primary"
          sx={{              
            fontWeight: 700, 
            mb: 3,
            fontSize: { xs: '2rem', md: '2.5rem' } 
          }}
        >
          Backed by
        </Typography>
        
        <Grid 
          container 
          spacing={4} 
          justifyContent="center"
          alignItems="center"
          sx={{ opacity: 0.8 }}
        >
          {sponsors.map((sponsor) => (
            <Grid item key={sponsor.id} xs={6} sm={6} md={3} lg={3}>
              <Box 
                sx={{ 
                  height: 40, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                >
                  {/* Here will be sponsors logos*/}
                <Box 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    fontWeight: 600,
                    mb: 1,
                    fontSize: '1.25rem'
                  }} 
                >
                  {sponsor.icon} &nbsp; {sponsor.name}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
        
        <Typography 
          variant="body2" 
          color="text.primary" 
          align="center" 
          sx={{ mt: 4, fontSize: '1rem' }}
        >
          And many more soon
        </Typography>
      </Container>
    </Box>
  );
}; 