import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Button, Stack } from '@mui/material';
import { DefaultLayout } from "../../layouts";

const StoriesPage: React.FC = () => {
  // Mock data for stories
  const stories = [
    {
      id: 1,
      title: 'The Future of Web3',
      author: 'Elena Wright',
      image: 'https://via.placeholder.com/300x200',
      readCount: 12400,
      likes: 890,
      isPremium: true,
    },
    {
      id: 2,
      title: 'Blockchain Evolution',
      author: 'Alex Thompson',
      image: 'https://via.placeholder.com/300x200',
      readCount: 8900,
      likes: 450,
      isPremium: false,
    },
    {
      id: 3,
      title: 'Decentralized Storytelling',
      author: 'Sarah Chen',
      image: 'https://via.placeholder.com/300x200',
      readCount: 15600,
      likes: 1200,
      isPremium: true,
    },
    {
      id: 4,
      title: 'NFTs in Literature',
      author: 'Michael Brown',
      image: 'https://via.placeholder.com/300x200',
      readCount: 7800,
      likes: 340,
      isPremium: false,
    },
  ];

  return (
    <DefaultLayout>
      <Box sx={{ p: 4, bgcolor: '#f7f7ff' }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4, color: '#4318d1', fontWeight: 'bold' }}>
          All Stories
        </Typography>

        <Grid container spacing={4}>
          {stories.map((story) => (
            <Grid item xs={12} sm={6} md={4} key={story.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={story.image}
                  alt={story.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" component="h2" sx={{ color: '#4318d1', fontWeight: 'bold' }}>
                        {story.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        by {story.author}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {story.readCount.toLocaleString()} reads
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {story.likes.toLocaleString()} likes
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: '#4318d1',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: '#3a14b8',
                        },
                      }}
                    >
                      Read Story
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DefaultLayout>
  );
};

export default StoriesPage; 