import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { selectStyles } from './TaleSort.styles';

const TaleSort: React.FC = () => {
  const [sortBy, setSortBy] = React.useState('newest');

  const handleChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="sort-select-label">Sort by</InputLabel>
        <Select
          labelId="sort-select-label"
          value={sortBy}
          label="Sort by"
          onChange={handleChange}
          sx={selectStyles}
        >
          <MenuItem value="newest">Newest</MenuItem>
          <MenuItem value="oldest">Oldest</MenuItem>
          <MenuItem value="popular">Most Popular</MenuItem>
          <MenuItem value="likes">Most Liked</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default TaleSort; 