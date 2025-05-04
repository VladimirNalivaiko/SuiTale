import React from 'react';
import { Box, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface MetadataToggleProps {
  onClick: () => void;
}

const MetadataToggle: React.FC<MetadataToggleProps> = ({ onClick }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Button
        onClick={onClick}
        startIcon={<ExpandMoreIcon />}
        variant="text"
        size="small"
        sx={{ 
          color: 'rgba(255,255,255,0.6)',
          '&:hover': {
            color: 'white',
            bgcolor: 'rgba(156, 77, 255, 0.1)',
          }
        }}
      >
        Add description and tags
      </Button>
    </Box>
  );
};

export default MetadataToggle; 