import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';;
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';

const features = [
  {
    id: 1,
    title: 'Just a few lines of code.',
    description: 'We make the hard things easy, so you can focus on your Tale. Dive into our intuitive editor and start writing.',
    icon: <HistoryEduIcon fontSize="large" />
  },
  {
    id: 2,
    title: 'Auth for all',
    description: 'Decentralization. All users are welcomed to be part of SuiTale family.',
    icon: <AccountBalanceWalletIcon fontSize="large" />
  },
  {
    id: 3,
    title: 'Community',
    description: 'We are a community of users who are passionate about bringing value to the world.',
    icon: <PeopleIcon fontSize="large" />
  },
  {
    id: 4,
    title: 'Battle-tested and hardened',
    description: 'Everything is built on top of Sui blockchain, which is one of the most secure and scalable blockchains.',
    icon: <SecurityIcon fontSize="large" />
  }
];

export const Features: React.FC = () => {
  return (
    <Box sx={{ py: 10 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            component="h2" 
            variant="h3"
            color="text.primary"
            sx={{              
              fontWeight: 700, 
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' } 
            }}
          >
            Just start your Tale.
          </Typography>
          <Typography 
            variant="body1"
            color="text.primary"
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            We make the hard things easy, so you can focus on your thoughts.
            Connect your wallet and start writing. We will make sure your tale is safe and securly stored in Walrus decentralized storage network.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} md={6} key={feature.id}>
              <Card 
                elevation={0}
                sx={{ 
                  p: 1,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      color: 'primary.main',
                      mb: 2 
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="h3"
                    color="text.secondary"
                    sx={{ 
                      fontWeight: 600,
                      mb: 1,
                      fontSize: '1.25rem'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2"
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.95rem',
                      lineHeight: 1.5
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}; 