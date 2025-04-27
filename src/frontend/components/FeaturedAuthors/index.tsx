import React from 'react';
import { Avatar, Box, Button, Card, Container, Grid, Typography } from '@mui/material';
import { Author } from '../../types';
import { featuredAuthors } from '../../data';

export const FeaturedAuthors: React.FC = () => {
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
          Featured Authors
        </Typography>

        <Grid container spacing={4}>
          {featuredAuthors.map((author) => (
            <Grid item xs={12} md={4} key={author.id}>
              <Card sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar
                    src={author.avatar}
                    alt={author.name}
                    sx={{ width: 48, height: 48, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">{author.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {author.stories}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {author.followers}
                  </Typography>
                  <Button variant="outlined" size="small">
                    Follow
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}; 