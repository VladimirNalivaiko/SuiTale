import React from 'react';
import { Box, Card, CardContent, CardMedia, Button, Stack, Typography } from '@mui/material';
import { cardStyles, cardContentStyles, titleStyles, statsBoxStyles, readButtonStyles } from './TaleCard.styles';

interface Tale {
  id: number;
  title: string;
  author: string;
  image: string;
  readCount: number;
  likes: number;
}

interface TaleCardProps {
  tale: Tale;
}

const TaleCard: React.FC<TaleCardProps> = ({ tale }) => {
  const defaultImage = '../../../assets/images/testnetAnnouncement.png';
  
  return (
    <Card sx={cardStyles}>
      <CardMedia
        component="img"
        height="200"
        image={tale.image || defaultImage}
        alt={tale.title}
      />
      <CardContent sx={cardContentStyles}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" component="h2" sx={titleStyles}>
              {tale.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              by {tale.author}
            </Typography>
          </Box>

          <Box sx={statsBoxStyles}>
            <Typography variant="body2" color="text.secondary">
              {tale.readCount.toLocaleString()} reads
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tale.likes.toLocaleString()} likes
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            sx={readButtonStyles}
          >
            Read Tale
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TaleCard; 