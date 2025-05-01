import React from 'react';
import { Box, Card, CardContent, CardMedia, Container, Grid, Typography } from '@mui/material';
import { popularTales } from '../../data';

export const PopularTales: React.FC = () => {
  const defaultImage = '../../../assets/images/testnetAnnouncement.png';
  return (
    <Box sx={{ bgcolor: "grey.50", py: 8 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 4 }}
        >
          Popular Tales
        </Typography>

        <Grid container spacing={4}>
          {popularTales.map((tale) => (
            <Grid item xs={12} md={4} key={tale.id} component="div">
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={defaultImage}
                  alt={tale.title}
                />
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {tale.title}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {tale.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tale.reads}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}; 