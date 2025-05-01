import React from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';

export const Hero: React.FC = () => {
  return (
    <Box
      sx={{
        bgcolor: "primary.main",
        color: "white",
        py: 8,
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom>
          Decentralized Tales on SUI Blockchain
        </Typography>
        <Typography variant="h6" gutterBottom>
          Create, publish, and own your tales in Web3
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            color="secondary"
            sx={{ borderRadius: 1 }}
          >
            Start Writing
          </Button>
          <Button variant="outlined" color="inherit" sx={{ borderRadius: 1 }}>
            Learn More
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}; 