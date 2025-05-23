import React from 'react';
import { Box, Button, Container, Stack, Typography, Grid, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const Hero: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography 
                variant="h2" 
                component="h1"
                color="text.primary"
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' } 
                }}
              >
                Decentralized Tales on <span style={{ fontStyle: 'italic' }}>Sui</span> Blockchain
                Built on <span style={{ fontStyle: 'italic' }}>Walrus</span>
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4,
                  color: 'text.secondary',
                  fontSize: '1.1rem',
                  lineHeight: 1.5
                }}
              >
                Create. Publish. Share. Earn. Be decentralized. SuiTale is a decentralized platform for creating and sharing tales on the Sui blockchain.
              </Typography>
              
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mb: 4, justifyContent: { xs: 'center', md: 'flex-start' } }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ 
                    px: 3,
                    py: 1.5,
                    borderRadius: 1,
                    fontSize: '1rem'
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="text" 
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    fontSize: '1rem',
                  }}
                >
                  View Docs
                </Button>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* First (back) screen - icon panel */}
              <Box
                sx={{
                  width: { xs: '70%', md: '60%' },
                  height: 'auto',
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: theme.shadows[3],
                  p: 2,
                  position: 'relative',
                  zIndex: 1,
                  mr: { xs: 0, md: -10 },
                  mt: { xs: 0, md: -5 },
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateX(-15px)'
                  }
                }}
              >
                <Box sx={{ height: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.primary',
                        fontSize: '1.2rem', 
                        display: 'block',
                        mb: 1,
                        width: '100%',
                        fontWeight: 'bold',
                      }}
                    >
                      Tale Statistics
                    </Typography>
                  </Box>
                  
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ width: '16px', height: '16px', borderRadius: '50%', bgcolor: item % 2 === 0 ? 'primary.main' : 'secondary.main', mr: 1 }} />
                      <Box sx={{ height: '8px', width: '70%', bgcolor: 'action.hover', borderRadius: 1 }} />
                      <Box sx={{ ml: 'auto', height: '16px', width: '16px', borderRadius: '50%', bgcolor: 'action.hover' }} />
                    </Box>
                  ))}
                </Box>
              </Box>
              
              {/* Second (front) screen - mobile device */}
              <Box
                sx={{
                  width: { xs: '65%', md: '50%' },
                  height: 'auto',
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: theme.shadows[5],
                  p: 2,
                  position: 'absolute',
                  top: { xs: '20%', md: '15%' },
                  right: { xs: '5%', md: '10%' },
                  zIndex: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateX(10px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '320px' }}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.primary',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignSelf: 'start',
                      }}>
                      SuiTale App
                    </Typography>
                  </Box>
                  
                  <Box sx={{ px: 1, py: 2 }}>
                    <Box 
                      sx={{ 
                        bgcolor: 'background.default',
                        p: 2, 
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        mb: 2
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block', mb: 1 }}>
                        Featured Tale
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'bold', fontSize: '0.85rem', mb: 0.5 }}>
                        The Sui Chronicles
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block' }}>
                        by @crypto_writer
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 'auto', p: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      sx={{ 
                        borderRadius: 1,
                        py: 1,
                        fontSize: '0.8rem',
                        mb: 1
                      }}
                    >
                      Connect Wallet
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      sx={{ 
                        borderRadius: 1,
                        py: 1,
                        fontSize: '0.8rem' 
                      }}
                    >
                      Read Popular Tales
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}; 