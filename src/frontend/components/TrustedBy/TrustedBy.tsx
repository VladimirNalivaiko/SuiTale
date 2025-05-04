import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';

const SuiLogo = '../../../assets/svg/companies/sui.svg';
const WalrusLogo = '../../../assets/svg/companies/walrus.svg';

// Логотипы компаний
const companyLogos = [
  { id: 1, name: 'Sui', logoUrl: SuiLogo },
  { id: 2, name: 'Walrus', logoUrl: WalrusLogo },
];

export const TrustedBy: React.FC = () => {
  return (
    <Box 
      sx={{ 
        py: 4, 
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider'
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
          sx={{ opacity: 0.8 }}
        >
          {companyLogos.map((company) => (
            <Grid item key={company.id} xs={4} sm={2}>
              <Box 
                sx={{ 
                  height: 40, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Here will be the logo */}
                <Box 
                  sx={{ 
                    width: 100, 
                    height: 40,
                    borderRadius: 1 ,
                    backgroundImage:`url(${company.logoUrl})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              </Box>
            </Grid>
          ))}
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