import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import { TaleCard, TaleSearch, TaleSort, TaleFilters } from '../../components/Tales';
import { DefaultLayout } from '../../layouts';

const mockTales = [
  {
    id: 1,
    title: 'The Last Dragon',
    author: 'John Smith',
    image: '',
    readCount: 1234,
    likes: 567,
  },
  {
    id: 2,
    title: 'Space Odyssey',
    author: 'Jane Doe',
    image: '',
    readCount: 2345,
    likes: 789,
  },
  {
    id: 3,
    title: 'Mystery of the Old House',
    author: 'Bob Johnson',
    image: '',
    readCount: 3456,
    likes: 890,
  },
  {
    id: 4,
    title: 'Love in Paris',
    author: 'Alice Brown',
    image: '',
    readCount: 4567,
    likes: 901,
  },
  {
    id: 5,
    title: 'The Lost Treasure',
    author: 'Charlie Wilson',
    image: '',
    readCount: 5678,
    likes: 234,
  },
  {
    id: 6,
    title: 'Haunted Mansion',
    author: 'Diana Clark',
    image: '',
    readCount: 6789,
    likes: 345,
  },
];

const TalesPage: React.FC = () => {
  return (
    <DefaultLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          All Tales
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TaleSearch />
          </Grid>
          <Grid item xs={12} md={4}>
            <TaleSort />
          </Grid>
          <Grid item xs={12}>
            <TaleFilters />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                {mockTales.map((tale) => (
                  <Grid item xs={12} sm={6} md={4} key={tale.id}>
                    <TaleCard tale={tale} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </DefaultLayout>
  );
};

export default TalesPage;