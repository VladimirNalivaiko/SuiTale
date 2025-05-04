import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface SlashTipProps {
  show: boolean;
}

const SlashTip: React.FC<SlashTipProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <Box 
      sx={{
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'rgba(156, 77, 255, 0.1)',
          p: 1,
          borderRadius: 2,
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Tip: Type <Box component="span" sx={{ fontWeight: 'bold', color: '#9c4dff' }}>/</Box> to open the block menu
        </Typography>
      </Paper>
    </Box>
  );
};

export default SlashTip; 