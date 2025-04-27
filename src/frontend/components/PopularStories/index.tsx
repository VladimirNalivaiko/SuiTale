import React from 'react';
import { Box, Card, CardContent, CardMedia, Container, Grid, Typography } from '@mui/material';
import { Story } from '../../types';
import { popularStories } from '../../data';

export const PopularStories: React.FC = () => {
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
          Popular Stories
        </Typography>

        <Grid container spacing={4}>
          {popularStories.map((story) => (
            <Grid item xs={12} md={4} key={story.id} component="div">
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
                  image={story.image}
                  alt={story.title}
                />
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {story.title}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {story.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {story.reads}
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