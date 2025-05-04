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
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="subtitle2" 
          color="text.secondary" 
          align="center" 
          sx={{ 
            mb: 4,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '0.75rem'
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
            <Grid item key={sponsor.id} xs={6} sm={4} md={2}>
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
                    color: 'text.secondary',
                    borderRadius: 1 
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
          color="text.secondary" 
          align="center" 
          sx={{ mt: 4, fontSize: '0.75rem' }}
        >
          And many more soon
        </Typography>
      </Container>
    </Box>
  );
}; 