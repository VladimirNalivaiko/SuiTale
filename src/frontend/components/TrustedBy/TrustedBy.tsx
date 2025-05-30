import React from 'react';
import { Box, Container, Typography, Grid, useTheme } from '@mui/material';

// Assumed paths to icons. You will need to replace them with actual ones.
const SuiLogoLight = '../../../assets/svg/companies/sui-light.svg'; // Example for light theme
const SuiLogoDark = '../../../assets/svg/companies/sui-dark.svg';   // Example for dark theme
const WalrusLogoLight = '../../../assets/svg/companies/walrus-light.svg';
const WalrusLogoDark = '../../../assets/svg/companies/walrus-dark.svg';

// Updated structure for company logos
const companyLogos = [
  { 
    id: 1, 
    name: 'Sui', 
    logoUrlLight: SuiLogoLight, // Use current SuiLogo as light version
    logoUrlDark: SuiLogoDark    // Add path to dark version of Sui logo here
  },
  { 
    id: 2, 
    name: 'Walrus', 
    logoUrlLight: WalrusLogoLight, // Use current WalrusLogo as light version
    logoUrlDark: WalrusLogoDark     // Add path to dark version of Walrus logo here
  },
  // Add other companies following the same pattern
];

export const TrustedBy: React.FC = () => {
  const theme = useTheme();
  const currentMode = theme.palette.mode;

  return (
    <Box 
      sx={{ 
        py: 4, 
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="subtitle2" 
          color="text.secondary" 
          align="center" 
          sx={{ 
            mb: 3,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '0.75rem'
          }}
        >
          Trusted by the most exciting projects in Sui
        </Typography>
        
        <Grid 
          container 
          spacing={3} 
          justifyContent="center"
          alignItems="center"
        >
          {companyLogos.map((company) => {
            const logoUrl = currentMode === 'light' ? company.logoUrlLight : company.logoUrlDark;
            return (
              <Grid item key={company.id} xs={6} sm={4} md={3} lg={2}>
                <Box 
                  sx={{ 
                    height: 40, 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box 
                    sx={{
                      width: '100%',
                      maxWidth: 120, 
                      height: '100%',
                      borderRadius: 1 ,
                      backgroundImage:`url(${logoUrl})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      transition: 'opacity 0.3s ease-in-out',
                      opacity: 0.85,
                      '&:hover': {
                        opacity: 1,
                      }
                    }}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 3, fontSize: '0.75rem' }}
        >
          And many more
        </Typography>
      </Container>
    </Box>
  );
}; 