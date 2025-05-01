import React from 'react';
import { Box, Chip, Stack } from '@mui/material';
import { chipStyles, stackStyles } from './TaleFilters.styles';

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
      <Stack sx={stackStyles}>
        {filters.map((filter) => (
          <Chip
            key={filter}
            label={filter}
            onClick={() => handleFilterClick(filter)}
            color={selectedFilters.includes(filter) ? 'primary' : 'default'}
            sx={chipStyles}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default TaleFilters; 