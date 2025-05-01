import React from 'react';
import { Box, Chip, Stack } from '@mui/material';

const TaleFilters: React.FC = () => {
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);

  const filters = [
    'Fantasy',
    'Sci-Fi',
    'Mystery',
    'Romance',
    'Adventure',
    'Horror',
    'Comedy',
  ];

  const handleFilterClick = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
        {filters.map((filter) => (
          <Chip
            key={filter}
            label={filter}
            onClick={() => handleFilterClick(filter)}
            color={selectedFilters.includes(filter) ? 'primary' : 'default'}
            sx={{
              '&:hover': {
                bgcolor: 'primary.light',
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}; 

export default TaleFilters;