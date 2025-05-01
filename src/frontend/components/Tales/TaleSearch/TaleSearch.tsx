import React from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { textFieldStyles } from './TaleSearch.styles';

const TaleSearch: React.FC = () => {
  return (
    <Box>
      <TextField
        fullWidth
        placeholder="Search tales..."
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={textFieldStyles}
      />
    </Box>
  );
};

export default TaleSearch; 